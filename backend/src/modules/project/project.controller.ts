import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { ApiError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { successResponse, createdResponse, noContentResponse } from '@/utils/response';
import {
  createProjectSchema,
  updateProjectSchema,
  saveSchemaSchema,
} from './project.dto';

const projectService = new ProjectService();

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { workspaceId } = req.params;
  if (!workspaceId) {
    throw new ApiError(400, 'Workspace ID parameter is required');
  }

  const validatedData = createProjectSchema.parse(req.body);
  const project = await projectService.createProject(workspaceId, req.user.id, validatedData);

  return createdResponse(res, { project });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Project ID parameter is required');
  }

  const project = await projectService.getProject(id);

  return successResponse(res, { project });
});

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  if (!workspaceId) {
    throw new ApiError(400, 'Workspace ID parameter is required');
  }

  const includeArchived = req.query.includeArchived === 'true';
  const projects = await projectService.listProjects(workspaceId, includeArchived);

  return successResponse(res, { projects });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Project ID parameter is required');
  }

  const validatedData = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(id, validatedData);

  return successResponse(res, { project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Project ID parameter is required');
  }

  await projectService.deleteProject(id);

  return noContentResponse(res);
});

export const archiveProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'Project ID parameter is required');
  }

  const project = await projectService.archiveProject(id);

  return successResponse(res, { project });
});

export const saveSchema = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { id } = req.params; // projectId
  if (!id) {
    throw new ApiError(400, 'Project ID parameter is required');
  }

  const validatedData = saveSchemaSchema.parse(req.body);
  const schema = await projectService.saveSchema(id, req.user.id, validatedData);

  return successResponse(res, { schema });
});
