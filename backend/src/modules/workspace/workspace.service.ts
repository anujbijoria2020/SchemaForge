import crypto from 'crypto';
import { WorkspaceRepository } from './workspace.repository';
import { ApiError } from '@/utils/ApiError';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  CreateInvitationDto,
} from './workspace.dto';

export class WorkspaceService {
  private workspaceRepository = new WorkspaceRepository();

  async createWorkspace(ownerId: string, data: CreateWorkspaceDto) {
    const existing = await this.workspaceRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(400, 'Workspace slug already exists');
    }

    return this.workspaceRepository.create(ownerId, data);
  }

  async getWorkspaceById(id: string) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }
    return workspace;
  }

  async getWorkspaceBySlug(slug: string) {
    const workspace = await this.workspaceRepository.findBySlug(slug);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }
    return workspace;
  }

  async getMyWorkspaces(userId: string) {
    return this.workspaceRepository.findAllForUser(userId);
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    if (data.slug) {
      const existing = await this.workspaceRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new ApiError(400, 'Workspace slug already exists');
      }
    }

    return this.workspaceRepository.update(id, data);
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }
    return this.workspaceRepository.delete(id);
  }

  // --- Members ---

  async listMembers(workspaceId: string) {
    return this.workspaceRepository.listMembers(workspaceId);
  }

  async addMember(workspaceId: string, data: AddMemberDto) {
    // Check if user exists in our system
    // (WorkspaceRepository can find user by ID using direct query or prisma)
    // Let's verify using prisma client or findById
    const userExists = await this.workspaceRepository.findMember(workspaceId, data.userId);
    if (userExists) {
      throw new ApiError(400, 'User is already a member of this workspace');
    }

    return this.workspaceRepository.addMember(workspaceId, data.userId, data.role);
  }

  async removeMember(workspaceId: string, userId: string) {
    const member = await this.workspaceRepository.findMember(workspaceId, userId);
    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'owner') {
      throw new ApiError(400, 'Cannot remove the owner of the workspace');
    }

    return this.workspaceRepository.removeMember(workspaceId, member.userId);
  }

  async updateMemberRole(workspaceId: string, userId: string, data: UpdateMemberRoleDto) {
    const member = await this.workspaceRepository.findMember(workspaceId, userId);
    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'owner') {
      throw new ApiError(400, 'Cannot modify the owner role');
    }

    return this.workspaceRepository.updateMemberRole(workspaceId, member.userId, data.role);
  }

  // --- Invitations ---

  async inviteUser(workspaceId: string, invitedBy: string, data: CreateInvitationDto) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Check if user is already a member
    const invitedUser = await this.workspaceRepository.findUserByEmail(data.email);
    if (invitedUser) {
      const isMember = await this.workspaceRepository.findMember(workspaceId, invitedUser.id);
      if (isMember) {
        throw new ApiError(400, 'User is already a member of this workspace');
      }
    }

    // Revoke any existing pending invitations to the same email address
    const existingInvitation = await this.workspaceRepository.findPendingInvitationByEmail(workspaceId, data.email);
    if (existingInvitation) {
      await this.workspaceRepository.deleteInvitation(existingInvitation.id);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    return this.workspaceRepository.createInvitation(
      workspaceId,
      invitedBy,
      data.email,
      data.role,
      token,
      expiresAt
    );
  }

  async listInvitations(workspaceId: string) {
    return this.workspaceRepository.listInvitations(workspaceId);
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.workspaceRepository.findInvitationByToken(token);
    if (!invitation) {
      throw new ApiError(404, 'Invitation not found or invalid token');
    }
    return invitation;
  }

  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const invitation = await this.workspaceRepository.findInvitationByToken(token);
    if (!invitation) {
      throw new ApiError(404, 'Invitation not found or invalid token');
    }

    if (invitation.status !== 'pending') {
      throw new ApiError(400, `Invitation cannot be accepted because status is ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      throw new ApiError(400, 'Invitation has expired');
    }

    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ApiError(400, 'This invitation was sent to a different email address');
    }

    // Check if user is already a member
    const existingMember = await this.workspaceRepository.findMember(invitation.workspaceId, userId);
    if (existingMember) {
      // Just mark accepted if they are already in the workspace
      await this.workspaceRepository.updateInvitationStatus(invitation.id, 'accepted');
      return existingMember;
    }

    // Process transaction: Add member and accept invitation
    return this.workspaceRepository.addMember(invitation.workspaceId, userId, invitation.role)
      .then(async (newMember) => {
        await this.workspaceRepository.updateInvitationStatus(invitation.id, 'accepted');
        return newMember;
      });
  }

  async rejectInvitation(token: string, userEmail: string) {
    const invitation = await this.workspaceRepository.findInvitationByToken(token);
    if (!invitation) {
      throw new ApiError(404, 'Invitation not found or invalid token');
    }

    if (invitation.status !== 'pending') {
      throw new ApiError(400, `Invitation cannot be rejected because status is ${invitation.status}`);
    }

    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ApiError(400, 'This invitation belongs to a different email address');
    }

    return this.workspaceRepository.updateInvitationStatus(invitation.id, 'rejected');
  }

  async revokeInvitation(workspaceId: string, invitationId: string) {
    const invitation = await this.workspaceRepository.findInvitationById(invitationId);
    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new ApiError(404, 'Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new ApiError(400, 'Only pending invitations can be revoked');
    }

    return this.workspaceRepository.updateInvitationStatus(invitation.id, 'revoked');
  }
}
