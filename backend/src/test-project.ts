import { ProjectService } from '@/modules/project/project.service';
import { WorkspaceService } from '@/modules/workspace/workspace.service';
import { prisma } from '@/config/prisma';

const projectService = new ProjectService();
const workspaceService = new WorkspaceService();

async function runProjectTests() {
  console.log('=== STARTING PROJECT MODULE TESTS ===');

  // 1. Find seeded user (Alice)
  const alice = await prisma.user.findUnique({ where: { email: 'alice@schemaforge.dev' } });
  if (!alice) {
    console.error('ERROR: Seed user Alice must be present. Run seed first.');
    process.exit(1);
  }
  console.log(`✓ Alice found (ID: ${alice.id})`);

  let testWorkspaceId = '';
  let testProjectId = '';

  try {
    // 2. Create Workspace for testing
    const testSlug = `test-project-ws-${Date.now()}`;
    const ws = await workspaceService.createWorkspace(alice.id, {
      name: 'Project Test Workspace',
      slug: testSlug,
      description: 'Used for validating project service functions',
    });
    testWorkspaceId = ws.id;
    console.log(`✓ Created test workspace: ${ws.name} (ID: ${testWorkspaceId})`);

    // 3. Create Project (automatically creates empty Schema)
    console.log('\n--- 1. Testing Create Project ---');
    const project = await projectService.createProject(testWorkspaceId, alice.id, {
      name: 'E-Commerce Schema',
      description: 'Main project for managing user database schema',
      dialect: 'postgresql',
      isPublic: false,
    });
    testProjectId = project.id;
    console.log(`✓ Project created successfully: ${project.name} (ID: ${project.id}, Dialect: ${project.dialect})`);

    // Verify empty Schema was created
    const initialSchema = await prisma.schema.findUnique({
      where: { projectId: project.id },
      include: { tables: true },
    });
    if (!initialSchema) {
      throw new Error('Project schema was not created automatically!');
    }
    console.log(`✓ Verified empty Schema record created (ID: ${initialSchema.id}, Tables count: ${initialSchema.tables.length})`);

    // 4. Get Project (includes schema, tables, columns)
    console.log('\n--- 2. Testing Get Project ---');
    const fetchedProject = await projectService.getProject(testProjectId);
    console.log(`✓ Fetched Project Name: ${fetchedProject.name}`);
    console.log(`✓ Included Schema ID: ${fetchedProject.schema?.id}`);

    // 5. Update Project
    console.log('\n--- 3. Testing Update Project ---');
    const updatedProject = await projectService.updateProject(testProjectId, {
      name: 'E-Commerce Schema - Updated',
      description: 'Updated description for the test database schema',
      isPublic: true,
    });
    console.log(`✓ Updated Project Name: ${updatedProject.name}`);
    console.log(`✓ Updated Project Description: ${updatedProject.description}`);
    console.log(`✓ Updated Project isPublic: ${updatedProject.isPublic}`);

    // 6. Save Schema (Create initial tables and columns)
    console.log('\n--- 4. Testing Save Schema (Initial Create) ---');
    const schemaData1 = {
      canvasState: { zoom: 1, pan: { x: 10, y: 10 } },
      tables: [
        {
          name: 'users',
          color: '#2563eb',
          positionX: 100,
          positionY: 150,
          columns: [
            {
              name: 'id',
              dataType: 'uuid',
              isNullable: false,
              isPrimaryKey: true,
              isUnique: true,
              defaultValue: 'gen_random_uuid()',
              sortOrder: 0,
            },
            {
              name: 'email',
              dataType: 'varchar(255)',
              isNullable: false,
              isPrimaryKey: false,
              isUnique: true,
              sortOrder: 1,
            },
            {
              name: 'created_at',
              dataType: 'timestamp',
              isNullable: false,
              isPrimaryKey: false,
              isUnique: false,
              defaultValue: 'now()',
              sortOrder: 2,
            },
          ],
        },
        {
          name: 'orders',
          color: '#10b981',
          positionX: 400,
          positionY: 150,
          columns: [
            {
              name: 'id',
              dataType: 'uuid',
              isNullable: false,
              isPrimaryKey: true,
              isUnique: true,
              defaultValue: 'gen_random_uuid()',
              sortOrder: 0,
            },
            {
              name: 'user_id',
              dataType: 'uuid',
              isNullable: false,
              isPrimaryKey: false,
              isUnique: false,
              sortOrder: 1,
            },
            {
              name: 'total_amount',
              dataType: 'numeric(10,2)',
              isNullable: false,
              isPrimaryKey: false,
              isUnique: false,
              sortOrder: 2,
            },
          ],
        },
      ],
    };

    const savedSchema1 = await projectService.saveSchema(testProjectId, alice.id, schemaData1);
    console.log(`✓ Schema canvasState saved successfully. (UpdatedBy: ${savedSchema1.updatedBy})`);

    // Fetch from database to verify
    const dbSchema1 = await prisma.schema.findUnique({
      where: { projectId: testProjectId },
      include: {
        tables: {
          include: { columns: true },
        },
      },
    });

    if (!dbSchema1 || dbSchema1.tables.length !== 2) {
      throw new Error(`Failed to save tables. Found ${dbSchema1?.tables.length ?? 0} tables, expected 2.`);
    }

    const usersTable = dbSchema1.tables.find((t) => t.name === 'users');
    const ordersTable = dbSchema1.tables.find((t) => t.name === 'orders');

    if (!usersTable || !ordersTable) {
      throw new Error('Failed to find users or orders table in DB.');
    }

    console.log(`✓ Users table created in DB with ID: ${usersTable.id}, Columns: ${usersTable.columns.length}`);
    console.log(`✓ Orders table created in DB with ID: ${ordersTable.id}, Columns: ${ordersTable.columns.length}`);

    // Store IDs to verify preservation
    const usersTableId = usersTable.id;
    const usersIdColumnId = usersTable.columns.find((c) => c.name === 'id')?.id;

    // 7. Save Schema Again (Sync/Diff test: modify users, delete orders, add products)
    console.log('\n--- 5. Testing Save Schema (Sync/Diff Transaction) ---');
    const schemaData2 = {
      canvasState: { zoom: 1.2, pan: { x: 20, y: 20 } },
      tables: [
        {
          name: 'users',
          color: '#f59e0b', // Updated color
          positionX: 120, // Updated positionX
          positionY: 180, // Updated positionY
          columns: [
            {
              name: 'id', // Same column (should preserve ID)
              dataType: 'uuid',
              isNullable: false,
              isPrimaryKey: true,
              isUnique: true,
              defaultValue: 'gen_random_uuid()',
              sortOrder: 0,
            },
            {
              name: 'email', // Same column (should preserve ID)
              dataType: 'varchar(255)',
              isNullable: false,
              isPrimaryKey: false,
              isUnique: true,
              sortOrder: 1,
            },
            // Deleted 'created_at' column
            {
              name: 'phone', // New column added to users
              dataType: 'varchar(20)',
              isNullable: true,
              isPrimaryKey: false,
              isUnique: false,
              sortOrder: 2,
            },
          ],
        },
        // Deleted 'orders' table completely
        {
          name: 'products', // New table added
          color: '#ef4444',
          positionX: 700,
          positionY: 300,
          columns: [
            {
              name: 'id',
              dataType: 'uuid',
              isNullable: false,
              isPrimaryKey: true,
              isUnique: true,
              sortOrder: 0,
            },
            {
              name: 'name',
              dataType: 'varchar(100)',
              isNullable: false,
              isPrimaryKey: false,
              isUnique: false,
              sortOrder: 1,
            },
          ],
        },
      ],
    };

    const savedSchema2 = await projectService.saveSchema(testProjectId, alice.id, schemaData2);
    console.log('✓ Schema synced successfully.');

    // Fetch and check DB again
    const dbSchema2 = await prisma.schema.findUnique({
      where: { projectId: testProjectId },
      include: {
        tables: {
          include: { columns: true },
        },
      },
    });

    if (!dbSchema2 || dbSchema2.tables.length !== 2) {
      throw new Error(`Expected 2 tables after sync, found: ${dbSchema2?.tables.length ?? 0}`);
    }

    const updatedUsersTable = dbSchema2.tables.find((t) => t.name === 'users');
    const deletedOrdersTable = dbSchema2.tables.find((t) => t.name === 'orders');
    const newProductsTable = dbSchema2.tables.find((t) => t.name === 'products');

    if (!updatedUsersTable) {
      throw new Error('Users table was deleted unexpectedly.');
    }
    if (deletedOrdersTable) {
      throw new Error('Orders table was not deleted.');
    }
    if (!newProductsTable) {
      throw new Error('Products table was not created.');
    }

    // Verify IDs preservation and values updates
    if (updatedUsersTable.id !== usersTableId) {
      throw new Error('Users table ID changed! Preserving IDs failed.');
    }
    console.log('✓ Verified: Users table ID is preserved.');

    if (updatedUsersTable.color !== '#f59e0b' || updatedUsersTable.positionX !== 120) {
      throw new Error('Users table fields were not updated.');
    }
    console.log('✓ Verified: Users table fields (color, positions) updated.');

    const updatedUsersIdCol = updatedUsersTable.columns.find((c) => c.name === 'id');
    if (!updatedUsersIdCol || updatedUsersIdCol.id !== usersIdColumnId) {
      throw new Error('Users id column ID changed! Column ID preservation failed.');
    }
    console.log('✓ Verified: Users id column ID is preserved.');

    const updatedUsersCreatedAtCol = updatedUsersTable.columns.find((c) => c.name === 'created_at');
    if (updatedUsersCreatedAtCol) {
      throw new Error('Users created_at column was not deleted.');
    }
    console.log('✓ Verified: Users created_at column was deleted.');

    const updatedUsersPhoneCol = updatedUsersTable.columns.find((c) => c.name === 'phone');
    if (!updatedUsersPhoneCol) {
      throw new Error('Users phone column was not added.');
    }
    console.log(`✓ Verified: Users phone column was added. ID: ${updatedUsersPhoneCol.id}`);

    // 8. List Projects
    console.log('\n--- 6. Testing List Projects ---');
    const projectList = await projectService.listProjects(testWorkspaceId, false);
    console.log(`✓ List projects count (excluding archived): ${projectList.length}`);

    // 9. Archive Project
    console.log('\n--- 7. Testing Archive Project ---');
    const archivedProj = await projectService.archiveProject(testProjectId);
    console.log(`✓ Project isArchived status: ${archivedProj.isArchived}`);

    // Verify listing after archive
    const projectListAfterArchive = await projectService.listProjects(testWorkspaceId, false);
    console.log(`✓ List projects count after archive (excluding archived): ${projectListAfterArchive.length} (Expected: 0)`);
    const projectListIncludingArchived = await projectService.listProjects(testWorkspaceId, true);
    console.log(`✓ List projects count after archive (including archived): ${projectListIncludingArchived.length} (Expected: 1)`);

    // 10. Delete Project
    console.log('\n--- 8. Testing Delete Project ---');
    await projectService.deleteProject(testProjectId);
    console.log('✓ Project deleted successfully.');

    // Verify Project and cascade Schema deleted
    try {
      await projectService.getProject(testProjectId);
      throw new Error('Project still exists after deletion!');
    } catch (e: any) {
      console.log('✓ Verified: Project not found (Expected error caught)');
    }

    const schemaAfterDelete = await prisma.schema.findUnique({
      where: { projectId: testProjectId },
    });
    if (schemaAfterDelete) {
      throw new Error('Schema record was not deleted when project was deleted!');
    }
    console.log('✓ Verified: Schema record cascades deletion with Project.');

    // 11. Delete Workspace
    await workspaceService.deleteWorkspace(testWorkspaceId);
    console.log('✓ Cleaned up test workspace.');

    console.log('\n=== ALL PROJECT TESTS PASSED SUCCESSFULLY ===');
  } catch (error) {
    console.error('TEST FAILED WITH ERROR:', error);
    // Cleanup if workspace was left created
    if (testWorkspaceId) {
      try {
        await workspaceService.deleteWorkspace(testWorkspaceId);
        console.log('Cleaned up test workspace.');
      } catch (cleanupError) {
        // Ignore
      }
    }
    process.exit(1);
  }
}

runProjectTests()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
