import { prisma } from '@/config/prisma';
import { Workspace, WorkspaceMember, WorkspaceInvitation, Prisma } from '@prisma/client';

export class WorkspaceRepository {
  async create(ownerId: string, data: { name: string; slug: string; description?: string | null }): Promise<Workspace> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the workspace
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          ownerId,
        },
      });

      // 2. Add the owner to the workspace members
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerId,
          role: 'owner',
        },
      });

      return workspace;
    });
  }

  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { slug },
    });
  }

  async findAllForUser(userId: string): Promise<Workspace[]> {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, data: Prisma.WorkspaceUpdateInput): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Workspace> {
    return prisma.workspace.delete({
      where: { id },
    });
  }

  // --- Members ---

  async addMember(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    return prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: {
        role,
      },
    });
  }

  async listMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  async findMember(workspaceId: string, userIdOrMemberId: string): Promise<WorkspaceMember | null> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    
    if (!isUuid(userIdOrMemberId)) {
      return null;
    }

    // 1. Try to find by primary key (WorkspaceMember ID)
    const memberById = await prisma.workspaceMember.findUnique({
      where: { id: userIdOrMemberId },
    });

    if (memberById && memberById.workspaceId === workspaceId) {
      return memberById;
    }

    // 2. Fallback to finding by workspaceId and userId (User ID)
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userIdOrMemberId,
        },
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // --- Invitations ---

  async createInvitation(
    workspaceId: string,
    invitedBy: string,
    email: string,
    role: string,
    token: string,
    expiresAt: Date
  ): Promise<WorkspaceInvitation> {
    return prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        invitedBy,
        email,
        role,
        token,
        expiresAt,
      },
    });
  }

  async findInvitationByToken(token: string): Promise<WorkspaceInvitation | null> {
    return prisma.workspaceInvitation.findUnique({
      where: { token },
    });
  }

  async findInvitationById(id: string): Promise<WorkspaceInvitation | null> {
    return prisma.workspaceInvitation.findUnique({
      where: { id },
    });
  }

  async findPendingInvitationByEmail(workspaceId: string, email: string): Promise<WorkspaceInvitation | null> {
    return prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email,
        status: 'pending',
      },
    });
  }

  async updateInvitationStatus(id: string, status: string): Promise<WorkspaceInvitation> {
    return prisma.workspaceInvitation.update({
      where: { id },
      data: { status },
    });
  }

  async listInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteInvitation(id: string): Promise<WorkspaceInvitation> {
    return prisma.workspaceInvitation.delete({
      where: { id },
    });
  }
}
