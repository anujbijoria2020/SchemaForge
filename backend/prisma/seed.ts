// Run with: npx prisma db seed
// Safe to run multiple times — uses upsert and createMany skipDuplicates

import prisma from '../src/config/prisma';
import * as bcrypt from 'bcrypt';

// Fixed UUIDs for Projects and Version to ensure idempotent upsert operations
const PROJECT_ECOMMERCE_ID = 'e7b1a6c4-727d-4b8c-a1d2-d1e9f1a2b3c4';
const PROJECT_BLOG_ID = 'b7b2a6c4-727d-4b8c-a1d2-d1e9f1a2b3c4';
const PROJECT_ANALYTICS_ID = 'a7b3a6c4-727d-4b8c-a1d2-d1e9f1a2b3c4';
const VERSION_ECOMMERCE_ID = 'v7b1a6c4-727d-4b8c-a1d2-d1e9f1a2b3c4';

async function main() {
  // 1. Hash password
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // 2. Upsert Alice, upsert Bob
  const alice = await prisma.user.upsert({
    where: { email: 'alice@schemaforge.dev' },
    update: {},
    create: {
      email: 'alice@schemaforge.dev',
      passwordHash: hashedPassword,
      displayName: 'Alice Dev',
      isVerified: true,
      plan: 'free',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@schemaforge.dev' },
    update: {},
    create: {
      email: 'bob@schemaforge.dev',
      passwordHash: hashedPassword,
      displayName: 'Bob Builder',
      isVerified: true,
      plan: 'free',
    },
  });

  // 3. Upsert alice-ws (needs alice.id as ownerId)
  const aliceWs = await prisma.workspace.upsert({
    where: { slug: 'alice-ws' },
    update: {},
    create: {
      name: "Alice's Workspace",
      slug: 'alice-ws',
      ownerId: alice.id,
      plan: 'free',
    },
  });

  // 4. Upsert bob-personal (needs bob.id as ownerId)
  const bobPersonal = await prisma.workspace.upsert({
    where: { slug: 'bob-personal' },
    update: {},
    create: {
      name: "Bob's Personal",
      slug: 'bob-personal',
      ownerId: bob.id,
      plan: 'free',
    },
  });

  // 5. Upsert WorkspaceMembers (needs both workspace IDs and user IDs)
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: aliceWs.id,
        userId: alice.id,
      },
    },
    update: {},
    create: {
      workspaceId: aliceWs.id,
      userId: alice.id,
      role: 'owner',
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: aliceWs.id,
        userId: bob.id,
      },
    },
    update: {},
    create: {
      workspaceId: aliceWs.id,
      userId: bob.id,
      role: 'editor',
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: bobPersonal.id,
        userId: bob.id,
      },
    },
    update: {},
    create: {
      workspaceId: bobPersonal.id,
      userId: bob.id,
      role: 'owner',
    },
  });

  // 6. Upsert all 3 Projects (needs aliceWs.id and user IDs)
  const projectEcommerce = await prisma.project.upsert({
    where: { id: PROJECT_ECOMMERCE_ID },
    update: {},
    create: {
      id: PROJECT_ECOMMERCE_ID,
      workspaceId: aliceWs.id,
      name: 'E-commerce Platform',
      dialect: 'postgresql',
      createdBy: alice.id,
    },
  });

  const projectBlog = await prisma.project.upsert({
    where: { id: PROJECT_BLOG_ID },
    update: {},
    create: {
      id: PROJECT_BLOG_ID,
      workspaceId: aliceWs.id,
      name: 'Blog CMS',
      dialect: 'mysql',
      createdBy: alice.id,
    },
  });

  const projectAnalytics = await prisma.project.upsert({
    where: { id: PROJECT_ANALYTICS_ID },
    update: {},
    create: {
      id: PROJECT_ANALYTICS_ID,
      workspaceId: aliceWs.id,
      name: 'Analytics DB',
      dialect: 'postgresql',
      createdBy: bob.id,
    },
  });

  // 7. Upsert Schema for each project (needs project IDs)
  await prisma.schema.upsert({
    where: { projectId: projectEcommerce.id },
    update: {},
    create: {
      projectId: projectEcommerce.id,
      canvasState: {} as any,
    },
  });

  await prisma.schema.upsert({
    where: { projectId: projectBlog.id },
    update: {},
    create: {
      projectId: projectBlog.id,
      canvasState: {} as any,
    },
  });

  await prisma.schema.upsert({
    where: { projectId: projectAnalytics.id },
    update: {},
    create: {
      projectId: projectAnalytics.id,
      canvasState: {} as any,
    },
  });

  // 8. Upsert Version for E-commerce Platform (needs project ID and alice.id)
  await prisma.version.upsert({
    where: { id: VERSION_ECOMMERCE_ID },
    update: {},
    create: {
      id: VERSION_ECOMMERCE_ID,
      projectId: projectEcommerce.id,
      label: 'Initial Schema',
      description: 'First version',
      isAuto: false,
      canvasState: {} as any,
      createdBy: alice.id,
    },
  });

  // 9. Create Notifications for Bob only if count is 0 (needs bob.id)
  const notificationCount = await prisma.notification.count();
  if (notificationCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: bob.id,
          type: 'invitation',
          title: "You were added to Alice's Workspace",
          body: null,
          isRead: false,
          metadata: {} as any,
        },
        {
          userId: bob.id,
          type: 'mention',
          title: "Alice mentioned you in E-commerce Platform",
          body: null,
          isRead: false,
          metadata: {} as any,
        },
      ],
    });
  }

  // Print summary table
  console.log(`Seeding complete:
✓ Users:              2
✓ Workspaces:         2
✓ WorkspaceMembers:   3
✓ Projects:           3
✓ Schemas:            3
✓ Versions:           1
✓ Notifications:      2`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
