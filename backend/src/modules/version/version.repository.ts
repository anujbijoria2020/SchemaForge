import { prisma } from '@/config/prisma';
import { Version, Prisma } from '@prisma/client';

export class VersionRepository {
  async create(data: {
    projectId: string;
    label?: string | null;
    description?: string | null;
    canvasState: any;
    createdBy: string;
    isAuto?: boolean;
  }): Promise<Version> {
    return prisma.version.create({
      data: {
        projectId: data.projectId,
        label: data.label,
        description: data.description,
        canvasState: data.canvasState as Prisma.InputJsonValue,
        createdBy: data.createdBy,
        isAuto: data.isAuto ?? false,
      },
    });
  }

  async findManyForProject(projectId: string) {
    return prisma.version.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<Version | null> {
    return prisma.version.findUnique({
      where: { id },
    });
  }

  async deleteManyOlderThan(projectId: string, thresholdDate: Date) {
    return prisma.version.deleteMany({
      where: {
        projectId,
        isAuto: true,
        createdAt: {
          lt: thresholdDate,
        },
      },
    });
  }
}
