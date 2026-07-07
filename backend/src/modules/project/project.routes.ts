import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize';
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
  archiveProject,
  saveSchema,
} from './project.controller';

const router = Router();

// Require authentication for all project routes
router.use(requireAuth);

// --- Projects under a Workspace ---
router.post('/workspaces/:workspaceId/projects', authorize('editor'), createProject);
router.get('/workspaces/:workspaceId/projects', authorize('viewer'), listProjects);

// --- Specific Project Operations ---
router.get('/projects/:id', authorize('viewer'), getProject);
router.patch('/projects/:id', authorize('editor'), updateProject);
router.delete('/projects/:id', authorize('admin'), deleteProject);
router.post('/projects/:id/archive', authorize('editor'), archiveProject);
router.post('/projects/:id/schema', authorize('editor'), saveSchema);

export default router;
