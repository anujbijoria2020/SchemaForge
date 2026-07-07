import { WorkspaceService } from '@/modules/workspace/workspace.service';
import { prisma } from '@/config/prisma';

const workspaceService = new WorkspaceService();

async function runTests() {
  console.log('=== STARTING WORKSPACE MODULE TESTS ===');

  // 1. Find seeded users (Alice and Bob)
  const alice = await prisma.user.findUnique({ where: { email: 'alice@schemaforge.dev' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@schemaforge.dev' } });

  if (!alice || !bob) {
    console.error('ERROR: Seed users Alice and Bob must be present. Run seed first.');
    process.exit(1);
  }

  console.log(`✓ Alice found (ID: ${alice.id})`);
  console.log(`✓ Bob found (ID: ${bob.id})`);

  const testSlug = `test-ws-${Date.now()}`;
  let testWorkspaceId = '';

  try {
    // 2. Create Workspace
    console.log('\n--- 1. Testing Create Workspace ---');
    const ws = await workspaceService.createWorkspace(alice.id, {
      name: 'Integration Test Workspace',
      slug: testSlug,
      description: 'Used for validating workspace service functions',
    });
    testWorkspaceId = ws.id;
    console.log(`✓ Workspace created successfully: ${ws.name} (Slug: ${ws.slug})`);

    // 3. Get Workspace
    console.log('\n--- 2. Testing Get Workspace ---');
    const fetchedWs = await workspaceService.getWorkspaceById(testWorkspaceId);
    console.log(`✓ Fetched by ID: ${fetchedWs.name}`);
    const fetchedBySlug = await workspaceService.getWorkspaceBySlug(testSlug);
    console.log(`✓ Fetched by Slug: ${fetchedBySlug.name}`);

    // 4. Update Workspace
    console.log('\n--- 3. Testing Update Workspace ---');
    const updatedWs = await workspaceService.updateWorkspace(testWorkspaceId, {
      name: 'Updated Integration Workspace Name',
    });
    console.log(`✓ Updated name: ${updatedWs.name}`);

    // 5. Member operations before invitation
    console.log('\n--- 4. Testing Member List ---');
    const membersBefore = await workspaceService.listMembers(testWorkspaceId);
    console.log(`✓ Current member count: ${membersBefore.length}`);
    const aliceMember = membersBefore.find((m: { userId: string }) => m.userId === alice.id);
    console.log(`✓ Alice role in list: ${aliceMember?.role} (Expected: owner)`);

    // 6. Invite User Flow
    console.log('\n--- 5. Testing Invitation Flow ---');
    const invitation = await workspaceService.inviteUser(testWorkspaceId, alice.id, {
      email: bob.email,
      role: 'editor',
    });
    console.log(`✓ Invitation created for Bob. Token: ${invitation.token}`);

    // Get invitation details by token
    const fetchedInvitation = await workspaceService.getInvitationByToken(invitation.token);
    console.log(`✓ Fetched invitation status: ${fetchedInvitation.status}`);

    // Accept invitation
    console.log('Accepting invitation as Bob...');
    const newMember = await workspaceService.acceptInvitation(invitation.token, bob.id, bob.email);
    console.log(`✓ Bob is now a member with role: ${newMember.role}`);

    // Verify Bob is member
    const membersAfter = await workspaceService.listMembers(testWorkspaceId);
    console.log(`✓ Members count after accept: ${membersAfter.length}`);
    const bobMember = membersAfter.find((m: { userId: string }) => m.userId === bob.id);
    console.log(`✓ Bob role in list: ${bobMember?.role} (Expected: editor)`);

    // 7. Update Member Role
    console.log('\n--- 6. Testing Member Role Update ---');
    const updatedMember = await workspaceService.updateMemberRole(testWorkspaceId, bob.id, {
      role: 'admin',
    });
    console.log(`✓ Bob's role updated to: ${updatedMember.role}`);

    // 8. Remove Member
    console.log('\n--- 7. Testing Member Removal ---');
    await workspaceService.removeMember(testWorkspaceId, bob.id);
    console.log('✓ Bob removed from workspace.');

    const membersFinal = await workspaceService.listMembers(testWorkspaceId);
    console.log(`✓ Final member count: ${membersFinal.length}`);

    // 9. Delete Workspace
    console.log('\n--- 8. Testing Delete Workspace ---');
    await workspaceService.deleteWorkspace(testWorkspaceId);
    console.log('✓ Workspace deleted successfully.');

    // Verify workspace deletion
    try {
      await workspaceService.getWorkspaceById(testWorkspaceId);
      console.error('ERROR: Workspace still exists after delete!');
      process.exit(1);
    } catch (e: any) {
      console.log('✓ Verified: Workspace no longer found (Expected error caught)');
    }

    console.log('\n=== ALL WORKSPACE TESTS PASSED SUCCESSFULLY ===');
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

runTests()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
