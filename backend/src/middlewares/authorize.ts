import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

export const ROLE_HIERARCHY = ['viewer', 'commenter', 'editor', 'admin', 'owner'] as const;
export type WorkspaceRole = typeof ROLE_HIERARCHY[number];

/**
 * Express middleware to authorize users based on their role in the workspace.
 * Extracts the workspaceId from request params (workspaceId, projectId, or id) and 
 * verifies if the user's role in that workspace meets the minimum role requirement.
 *
 * @param minRole The minimum required role (owner/admin/editor/viewer/commenter)
 */
export const authorize = (minRole: WorkspaceRole) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Ensure user is authenticated
    if (!req.user || !req.user.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const userId = req.user.id;
    let workspaceId: string | undefined = undefined;

    // 2. Extract workspaceId from params
    if (req.params.workspaceId) {
      workspaceId = req.params.workspaceId;
    } else if (req.params.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: req.params.projectId },
        select: { workspaceId: true },
      });
      if (!project) {
        throw new ApiError(404, 'Project not found');
      }
      workspaceId = project.workspaceId;
    } else if (req.params.id) {
      // Could be a workspace-level route or a project-level route.
      // We check if a project exists with this ID.
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        select: { workspaceId: true },
      });

      if (project) {
        workspaceId = project.workspaceId;
      } else {
        // If not a project, check if it's a workspace
        const workspace = await prisma.workspace.findUnique({
          where: { id: req.params.id },
          select: { id: true },
        });
        if (workspace) {
          workspaceId = workspace.id;
        } else {
          throw new ApiError(404, 'Resource not found');
        }
      }
    }

    if (!workspaceId) {
      throw new ApiError(400, 'Workspace context could not be determined from request parameters');
    }

    // 3. Query workspace_members to find the user's role
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    let role: WorkspaceRole | null = (member?.role as WorkspaceRole) || null;

    // Fallback: Check if user is the direct owner of the workspace
    if (!role) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      });
      if (workspace && workspace.ownerId === userId) {
        role = 'owner';
      }
    }

    if (!role) {
      throw new ApiError(403, 'Forbidden: You are not a member of this workspace');
    }

    // 4. Check hierarchy using ROLE_HIERARCHY array
    const userRoleIndex = ROLE_HIERARCHY.indexOf(role);
    const minRoleIndex = ROLE_HIERARCHY.indexOf(minRole);

    if (userRoleIndex === -1 || userRoleIndex < minRoleIndex) {
      throw new ApiError(403, 'Forbidden: Insufficient permissions');
    }

    next();
  });
};
