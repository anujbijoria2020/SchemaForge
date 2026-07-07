import { prisma } from '@/config/prisma';
import { Prisma } from '@prisma/client';

export interface LogActivityParams {
  projectId?: string | null;
  workspaceId?: string | null;
  actorId: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: any;
}

/**
 * Helper function to log activities asynchronously (fire-and-forget).
 * Catches errors internally and does not throw or block execution.
 */
export function logActivity(params: LogActivityParams): void {
  prisma.activityLog
    .create({
      data: {
        projectId: params.projectId || null,
        workspaceId: params.workspaceId || null,
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
        metadata: (params.metadata || {}) as Prisma.InputJsonValue,
      },
    })
    .catch((error) => {
      // Catches and logs to console without throwing or disrupting execution flow
      console.error('[ActivityLogger] Error creating activity log:', error);
    });
}
