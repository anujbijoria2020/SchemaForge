import { VersionService } from '@/modules/version/version.service';
import { ProjectService } from '@/modules/project/project.service';
import { WorkspaceService } from '@/modules/workspace/workspace.service';
import { prisma } from '@/config/prisma';

const versionService = new VersionService();
const projectService = new ProjectService();
const workspaceService = new WorkspaceService();

async function runVersionTests() {
  console.log('=== STARTING VERSION MODULE TESTS ===');

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
    // 2. Create Workspace
    const testSlug = `test-version-ws-${Date.now()}`;
    const ws = await workspaceService.createWorkspace(alice.id, {
      name: 'Version Test Workspace',
      slug: testSlug,
      description: 'Used for validating version service functions',
    });
    testWorkspaceId = ws.id;
    console.log(`✓ Created test workspace: ${ws.name} (ID: ${testWorkspaceId})`);

    // 3. Create Project
    const project = await projectService.createProject(testWorkspaceId, alice.id, {
      name: 'Versioned E-Commerce Schema',
      description: 'Project to test versions',
      dialect: 'postgresql',
      isPublic: false,
    });
    testProjectId = project.id;
    console.log(`✓ Project created: ${project.name} (ID: ${testProjectId})`);

    // 4. Update project schema canvas state
    const canvasState = { zoom: 1.5, nodes: [{ id: '1', type: 'table', data: { label: 'users' } }] };
    await projectService.saveSchema(testProjectId, alice.id, {
      canvasState,
      tables: [],
    });
    console.log('✓ Project schema canvasState updated.');

    // 5. Create Manual Snapshot
    console.log('\n--- 1. Testing Create Manual Snapshot ---');
    const manualVersion = await versionService.createSnapshot(testProjectId, alice.id, {
      label: 'v1.0.0',
      description: 'Initial Release',
      isAuto: false,
    });
    console.log(`✓ Manual version snapshot created successfully: ${manualVersion.label} (ID: ${manualVersion.id})`);
    if (manualVersion.isAuto !== false) {
      throw new Error('Manual snapshot isAuto must be false.');
    }

    // 6. Create Auto Snapshot
    console.log('\n--- 2. Testing Create Auto Snapshot ---');
    const autoVersion = await versionService.createSnapshot(testProjectId, alice.id, {
      label: 'Auto Save 1',
      description: 'Auto-saved schema state',
      isAuto: true,
    });
    console.log(`✓ Auto version snapshot created successfully: ${autoVersion.label} (ID: ${autoVersion.id})`);
    if (autoVersion.isAuto !== true) {
      throw new Error('Auto snapshot isAuto must be true.');
    }

    // 7. List Versions
    console.log('\n--- 3. Testing List Versions ---');
    const versions = await versionService.listVersions(testProjectId);
    console.log(`✓ Total versions found for project: ${versions.length}`);
    if (versions.length !== 2) {
      throw new Error(`Expected 2 versions in the list, found: ${versions.length}`);
    }

    // 8. Get Specific Version
    console.log('\n--- 4. Testing Get Specific Version ---');
    const fetchedVersion = await versionService.getVersion(manualVersion.id);
    console.log(`✓ Fetched version label: ${fetchedVersion.label}`);
    const state = fetchedVersion.canvasState as any;
    console.log(`✓ Fetched version zoom: ${state.zoom}`);
    if (state.zoom !== 1.5) {
      throw new Error(`Expected canvasState zoom to be 1.5, found: ${state.zoom}`);
    }

    // 9. Test Pruning auto-snapshots older than 30 days
    console.log('\n--- 5. Testing Prune Auto Snapshots ---');
    // Artificially backdate the auto snapshot to 35 days ago in the database
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

    await prisma.version.update({
      where: { id: autoVersion.id },
      data: { createdAt: thirtyFiveDaysAgo },
    });
    console.log('✓ Auto snapshot backdated to 35 days ago in DB.');

    // Run pruning
    const pruneResult = await versionService.pruneAutoSnapshots(testProjectId);
    console.log(`✓ Pruning completed. Database records deleted: ${pruneResult.count}`);
    if (pruneResult.count !== 1) {
      throw new Error(`Expected 1 snapshot to be pruned, but database deleted: ${pruneResult.count}`);
    }

    // Verify list again (should only have the manual version left)
    const finalVersions = await versionService.listVersions(testProjectId);
    console.log(`✓ Versions remaining after pruning: ${finalVersions.length}`);
    if (finalVersions.length !== 1) {
      throw new Error(`Expected 1 version left after pruning, found: ${finalVersions.length}`);
    }
    if (finalVersions[0].id !== manualVersion.id) {
      throw new Error('The wrong version was pruned! Manual version must remain.');
    }
    console.log('✓ Verified: Manual snapshot was not pruned.');

    // 10. Clean up
    console.log('\nCleaning up database records...');
    await projectService.deleteProject(testProjectId);
    await workspaceService.deleteWorkspace(testWorkspaceId);
    console.log('✓ Database records cleaned up.');

    console.log('\n=== ALL VERSION TESTS PASSED SUCCESSFULLY ===');
  } catch (error) {
    console.error('TEST FAILED WITH ERROR:', error);
    if (testProjectId) {
      try {
        await projectService.deleteProject(testProjectId);
      } catch (e) {}
    }
    if (testWorkspaceId) {
      try {
        await workspaceService.deleteWorkspace(testWorkspaceId);
      } catch (e) {}
    }
    process.exit(1);
  }
}

runVersionTests()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
