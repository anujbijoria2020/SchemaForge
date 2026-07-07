import { prisma } from '@/config/prisma';
import { Project, Schema, Prisma } from '@prisma/client';
import { ApiError } from '@/utils/ApiError';
import { CreateProjectDto, SaveSchemaDto } from './project.dto';

export class ProjectRepository {
  async create(
    workspaceId: string,
    creatorId: string,
    data: CreateProjectDto
  ): Promise<Project> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the project
      const project = await tx.project.create({
        data: {
          workspaceId,
          createdBy: creatorId,
          name: data.name,
          description: data.description,
          dialect: data.dialect,
          isPublic: data.isPublic,
        },
      });

      // 2. Create an empty Schema record for the project
      await tx.schema.create({
        data: {
          projectId: project.id,
          canvasState: {} as Prisma.InputJsonValue,
        },
      });

      return project;
    });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        schema: {
          include: {
            tables: {
              include: {
                columns: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
              orderBy: {
                name: 'asc',
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findAllInWorkspace(workspaceId: string, includeArchived = false): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        workspaceId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Project> {
    return prisma.project.delete({
      where: { id },
    });
  }

  async archive(id: string): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async saveSchema(projectId: string, userId: string, data: SaveSchemaDto): Promise<Schema> {
    return prisma.$transaction(async (tx) => {
      // 1. Find the schema associated with the project
      const schema = await tx.schema.findUnique({
        where: { projectId },
      });

      if (!schema) {
        throw new ApiError(404, 'Schema not found for this project');
      }

      const schemaId = schema.id;

      // 2. Update Schema canvasState and updatedBy fields
      const updatedSchema = await tx.schema.update({
        where: { id: schemaId },
        data: {
          canvasState: data.canvasState as Prisma.InputJsonValue,
          updatedBy: userId,
        },
      });

      // 3. Fetch existing tables and columns for diffing
      const existingTables = await tx.schemaTable.findMany({
        where: { schemaId },
        include: { columns: true },
      });

      const existingTableMap = new Map(existingTables.map((t) => [t.name, t]));
      const newTableNames = new Set(data.tables.map((t) => t.name));

      // 4. Delete tables that are not in the new layout
      const tablesToDelete = existingTables.filter((t) => !newTableNames.has(t.name));
      for (const table of tablesToDelete) {
        await tx.schemaTable.delete({
          where: { id: table.id },
        });
      }

      // 5. Sync/Upsert tables
      for (const table of data.tables) {
        const existingTable = existingTableMap.get(table.name);

        if (existingTable) {
          // Table exists -> Update visual/metadata properties
          await tx.schemaTable.update({
            where: { id: existingTable.id },
            data: {
              color: table.color,
              positionX: table.positionX,
              positionY: table.positionY,
            },
          });

          // Sync columns for this table
          const existingColumns = existingTable.columns;
          const existingColumnMap = new Map(existingColumns.map((c) => [c.name, c]));
          const newColumnNames = new Set(table.columns.map((c) => c.name));

          // Delete columns that are not in the new layout for this table
          const columnsToDelete = existingColumns.filter((c) => !newColumnNames.has(c.name));
          for (const col of columnsToDelete) {
            await tx.schemaColumn.delete({
              where: { id: col.id },
            });
          }

          // Upsert columns
          for (const col of table.columns) {
            const existingCol = existingColumnMap.get(col.name);

            if (existingCol) {
              // Column exists -> Update properties
              await tx.schemaColumn.update({
                where: { id: existingCol.id },
                data: {
                  dataType: col.dataType,
                  isNullable: col.isNullable,
                  isPrimaryKey: col.isPrimaryKey,
                  isUnique: col.isUnique,
                  defaultValue: col.defaultValue,
                  checkExpr: col.checkExpr,
                  sortOrder: col.sortOrder,
                },
              });
            } else {
              // Column is new -> Create under this table
              await tx.schemaColumn.create({
                data: {
                  tableId: existingTable.id,
                  name: col.name,
                  dataType: col.dataType,
                  isNullable: col.isNullable,
                  isPrimaryKey: col.isPrimaryKey,
                  isUnique: col.isUnique,
                  defaultValue: col.defaultValue,
                  checkExpr: col.checkExpr,
                  sortOrder: col.sortOrder,
                },
              });
            }
          }
        } else {
          // Table is brand new -> Create table and nested columns
          await tx.schemaTable.create({
            data: {
              schemaId,
              name: table.name,
              color: table.color,
              positionX: table.positionX,
              positionY: table.positionY,
              columns: {
                create: table.columns.map((col) => ({
                  name: col.name,
                  dataType: col.dataType,
                  isNullable: col.isNullable,
                  isPrimaryKey: col.isPrimaryKey,
                  isUnique: col.isUnique,
                  defaultValue: col.defaultValue,
                  checkExpr: col.checkExpr,
                  sortOrder: col.sortOrder,
                })),
              },
            },
          });
        }
      }

      return updatedSchema;
    });
  }
}
