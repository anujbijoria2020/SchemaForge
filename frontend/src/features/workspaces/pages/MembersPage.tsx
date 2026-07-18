import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { useWorkspace } from '../api/workspaces';
import {
  useWorkspaceMembers,
  useUpdateMemberRole,
  useRemoveMember,
  usePendingInvitations,
  useRevokeInvitation,
} from '../api/members';
import { MemberTable } from '../components/MemberTable';
import { PendingInvitesList } from '../components/PendingInvitesList';
import { InviteDialog } from '../components/InviteDialog';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';

export const MembersPage: React.FC = () => {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = useAuthStore((state) => state.user);

  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  // Queries
  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
  } = useWorkspace(workspaceId);

  const {
    data: members,
    isLoading: isMembersLoading,
    isError: isMembersError,
    error: membersError,
    refetch: refetchMembers,
  } = useWorkspaceMembers(workspaceId);

  const {
    data: invitations,
    isLoading: isInvitationsLoading,
    refetch: refetchInvitations,
  } = usePendingInvitations(workspaceId);

  // Mutations
  const { mutate: updateRole } = useUpdateMemberRole(workspaceId || '');
  const { mutate: removeMember } = useRemoveMember(workspaceId || '');
  const { mutate: revokeInvitation } = useRevokeInvitation(workspaceId || '');

  // Determine current user's role in this workspace
  const currentMember = members?.find((m) => m.userId === currentUser?.id);
  const currentUserRole = currentMember?.role;
  const isAdminOrOwner = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleRoleChange = (userId: string, role: 'admin' | 'editor' | 'viewer' | 'commenter') => {
    updateRole({ userId, role }, {
      onSuccess: () => {
        toast('Member role updated!', { variant: 'success' });
      },
    });
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMember({ userId }, {
        onSuccess: () => {
          toast('Member removed successfully.', { variant: 'success' });
        },
      });
    }
  };

  const handleRevokeInvitation = (invitationId: string) => {
    if (window.confirm('Are you sure you want to revoke this invitation?')) {
      revokeInvitation({ invitationId }, {
        onSuccess: () => {
          toast('Invitation revoked.', { variant: 'success' });
        },
      });
    }
  };

  const isLoading = isWorkspaceLoading || isMembersLoading;
  const isError = isWorkspaceError || isMembersError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans flex flex-col pb-16 animate-pulse">
        {/* Sub-Bar Skeleton */}
        <div className="border-b border-border-subtle bg-surface/30 h-12 py-3 px-6 sm:px-8" />
        {/* Main Content Skeleton */}
        <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8">
          <div className="space-y-3">
            <div className="h-6 w-48 bg-border rounded-xs" />
            <div className="h-4 w-96 bg-border rounded-xs" />
          </div>
          <div className="h-64 bg-border/20 border border-border-subtle rounded-sm" />
        </main>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans flex items-center justify-center p-6 flex-col">
        <div className="border border-destructive/30 bg-surface/50 max-w-lg w-full rounded-sm p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-md font-bold">Failed to load members</h3>
              <p className="text-xs text-secondary mt-0.5">
                {membersError instanceof Error ? membersError.message : 'An error occurred loading the workspace workspace members.'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-border-subtle/20 pt-4">
            <Button variant="secondary" size="sm" onClick={() => navigate('/app')}>
              Go to Dashboard
            </Button>
            <Button variant="primary" size="sm" onClick={() => { refetchMembers(); refetchInvitations(); }}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary font-sans flex flex-col pb-16 relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      {/* Workspace Sub-Bar (Navigation back) */}
      <div className="border-b border-border-subtle bg-surface/10 py-3 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to={`/app/workspaces/${workspaceId}`}
            className="text-xs text-secondary hover:text-primary transition-colors duration-150 flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {workspace.name}
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8 z-10 flex-1">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <h1 className="text-xl font-bold tracking-tight text-primary">
                Members & Collaborators
              </h1>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Manage workspace access, configure member roles, and view pending invitations for{' '}
              <span className="font-semibold text-primary">{workspace.name}</span>.
            </p>
          </div>

          {isAdminOrOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 font-semibold cursor-pointer self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Member Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pl-1">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Active Members
            </h3>
          </div>
          <MemberTable
            members={members}
            isLoading={isMembersLoading}
            currentUserRole={currentUserRole}
            currentUserId={currentUser?.id}
            onRoleChange={handleRoleChange}
            onRemoveMember={handleRemoveMember}
          />
        </div>

        {/* Pending Invitations List (Only visible to admin/owners) */}
        {isAdminOrOwner && (
          <PendingInvitesList
            invitations={invitations}
            isLoading={isInvitationsLoading}
            onRevoke={handleRevokeInvitation}
          />
        )}

      </main>

      {/* Invite Dialog */}
      {workspaceId && (
        <InviteDialog
          workspaceId={workspaceId}
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
        />
      )}
    </div>
  );
};
