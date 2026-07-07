import { Request, Response } from 'express';
import { WorkspaceService } from './workspace.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { successResponse, createdResponse, noContentResponse } from '@/utils/response';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  createInvitationSchema,
  acceptInvitationSchema,
} from './workspace.dto';

const workspaceService = new WorkspaceService();

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const validatedData = createWorkspaceSchema.parse(req.body);
  const workspace = await workspaceService.createWorkspace(req.user.id, validatedData);

  return createdResponse(res, { workspace });
});

export const getMyWorkspaces = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const workspaces = await workspaceService.getMyWorkspaces(req.user.id);

  return successResponse(res, { workspaces });
});

export const getWorkspaceById = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.id);

  return successResponse(res, { workspace });
});

export const updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = updateWorkspaceSchema.parse(req.body);
  const workspace = await workspaceService.updateWorkspace(req.params.id, validatedData);

  return successResponse(res, { workspace });
});

export const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
  await workspaceService.deleteWorkspace(req.params.id);

  return noContentResponse(res);
});

// --- Members ---

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await workspaceService.listMembers(req.params.workspaceId);

  return successResponse(res, { members });
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = addMemberSchema.parse(req.body);
  const member = await workspaceService.addMember(req.params.workspaceId, validatedData);

  return createdResponse(res, { member });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await workspaceService.removeMember(req.params.workspaceId, req.params.userId);

  return noContentResponse(res);
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = updateMemberRoleSchema.parse(req.body);
  const member = await workspaceService.updateMemberRole(
    req.params.workspaceId,
    req.params.userId,
    validatedData
  );

  return successResponse(res, { member });
});

// --- Invitations ---

export const inviteUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const validatedData = createInvitationSchema.parse(req.body);
  const invitation = await workspaceService.inviteUser(
    req.params.workspaceId,
    req.user.id,
    validatedData
  );

  return createdResponse(res, { invitation });
});

export const listInvitations = asyncHandler(async (req: Request, res: Response) => {
  const invitations = await workspaceService.listInvitations(req.params.workspaceId);

  return successResponse(res, { invitations });
});

export const getInvitation = asyncHandler(async (req: Request, res: Response) => {
  const invitation = await workspaceService.getInvitationByToken(req.params.token);

  return successResponse(res, { invitation });
});

export const acceptInvitation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id || !req.user?.email) {
    throw new ApiError(401, 'Unauthorized');
  }

  const validatedData = acceptInvitationSchema.parse(req.body);
  const member = await workspaceService.acceptInvitation(
    validatedData.token,
    req.user.id,
    req.user.email
  );

  return successResponse(res, { member });
});

export const rejectInvitation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.email) {
    throw new ApiError(401, 'Unauthorized');
  }

  const validatedData = acceptInvitationSchema.parse(req.body);
  await workspaceService.rejectInvitation(validatedData.token, req.user.email);

  return noContentResponse(res);
});

export const revokeInvitation = asyncHandler(async (req: Request, res: Response) => {
  await workspaceService.revokeInvitation(req.params.workspaceId, req.params.invitationId);

  return noContentResponse(res);
});
