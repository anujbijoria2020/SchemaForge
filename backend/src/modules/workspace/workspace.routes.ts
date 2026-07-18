import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize';
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  addMember,
  removeMember,
  updateMemberRole,
  inviteUser,
  listInvitations,
  getInvitation,
  acceptInvitation,
  rejectInvitation,
  revokeInvitation,
  getMyInvitations,
} from './workspace.controller';

const router = Router();

// Apply authentication to all workspace routes
router.use(requireAuth);

// --- Invitation Accept/Reject (Context-independent of specific workspace route param) ---
router.post('/invitations/accept', acceptInvitation);
router.post('/invitations/reject', rejectInvitation);
router.get('/invitations/:token', getInvitation);
router.get('/my-invitations', getMyInvitations);

// --- Workspace CRUD ---
router.post('/', createWorkspace);
router.get('/', getMyWorkspaces);
router.get('/:id', authorize('viewer'), getWorkspaceById);
router.patch('/:id', authorize('admin'), updateWorkspace);
router.delete('/:id', authorize('owner'), deleteWorkspace);

// --- Workspace Members ---
router.get('/:workspaceId/members', authorize('viewer'), listMembers);
router.post('/:workspaceId/members', authorize('admin'), addMember);
router.patch('/:workspaceId/members/:userId', authorize('admin'), updateMemberRole);
router.delete('/:workspaceId/members/:userId', authorize('admin'), removeMember);

// --- Workspace Invitations ---
router.get('/:workspaceId/invitations', authorize('admin'), listInvitations);
router.post('/:workspaceId/invitations', authorize('admin'), inviteUser);
router.delete('/:workspaceId/invitations/:invitationId', authorize('admin'), revokeInvitation);

export default router;
