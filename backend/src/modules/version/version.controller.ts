import { Request, Response } from 'express';
import { VersionService } from './version.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { successResponse, createdResponse } from '@/utils/response';
import { createVersionSchema } from './version.dto';

const versionService = new VersionService();

export const createVersion = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { id: projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, 'Project ID parameter is required');
  }

  const validatedData = createVersionSchema.parse(req.body);
  const version = await versionService.createSnapshot(projectId, req.user.id, {
    label: validatedData.label,
    description: validatedData.description,
    isAuto: false, // Manual snapshot
  });

  return createdResponse(res, { version });
});

export const listVersions = asyncHandler(async (req: Request, res: Response) => {
  const { id: projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, 'Project ID parameter is required');
  }

  const versions = await versionService.listVersions(projectId);

  return successResponse(res, { versions });
});

export const getVersion = asyncHandler(async (req: Request, res: Response) => {
  const { versionId } = req.params;
  if (!versionId) {
    throw new ApiError(400, 'Version ID parameter is required');
  }

  const version = await versionService.getVersion(versionId);

  return successResponse(res, { version });
});
