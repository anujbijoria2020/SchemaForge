import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize';
import {
  createVersion,
  listVersions,
  getVersion,
} from './version.controller';

const router = Router({ mergeParams: true });

// Require authentication for all version endpoints
router.use(requireAuth);

// --- Version Snapshots for a Project ---
// Note: :id is the Project ID, used by authorize middleware to verify workspace privileges
router.post('/:id/versions', authorize('editor'), createVersion);
router.get('/:id/versions', authorize('viewer'), listVersions);
router.get('/:id/versions/:versionId', authorize('viewer'), getVersion);

export default router;
