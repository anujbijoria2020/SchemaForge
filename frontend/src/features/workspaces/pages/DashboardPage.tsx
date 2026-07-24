import * as React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useWorkspaces } from '../api/workspaces';
import { useMyInvitations, useAcceptInvitation, useRejectInvitation } from '../api/members';
import { UserPendingInvitesList } from '../components/UserPendingInvitesList';
import { WorkspaceGrid } from '../components/WorkspaceGrid';
import { RecentProjectsRail } from '../components/RecentProjectsRail';
import { CreateWorkspaceDialog } from '../components/CreateWorkspaceDialog';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import { SidebarLayout } from '../../../shared/components/SidebarLayout';
import { Plus, LayoutGrid } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Set active workspace ID to null when landing on dashboard
  React.useEffect(() => {
    setActiveWorkspaceId(null);
  }, [setActiveWorkspaceId]);

  const { toast } = useToast();

  const {
    data: workspaces,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspaces();

  const {
    data: invitations,
    isLoading: isInvitesLoading,
  } = useMyInvitations();

  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutate: rejectInvitation, isPending: isRejecting } = useRejectInvitation();

  const handleAcceptInvite = (token: string) => {
    acceptInvitation(
      { token },
      {
        onSuccess: () => {
          toast('Invitation accepted! Welcome to the workspace.', { variant: 'success' });
          refetch();
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to accept invitation.', { variant: 'danger' });
        },
      }
    );
  };

  const handleRejectInvite = (token: string) => {
    rejectInvitation(
      { token },
      {
        onSuccess: () => {
          toast('Invitation declined.', { variant: 'success' });
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to decline invitation.', { variant: 'danger' });
        },
      }
    );
  };

  return (
    <SidebarLayout>
      <div className="relative pb-16 w-full flex-1">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />

        {/* Main Dashboard Container */}
        <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-12 z-10 relative">
          
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
              <p className="text-sm text-secondary mt-1">
                Select an existing workspace or design database schemas from your recent list.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 font-semibold shadow-md self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              Create Workspace
            </Button>
          </div>

          {/* User Incoming Invitations */}
          <UserPendingInvitesList
            invitations={invitations}
            isLoading={isInvitesLoading}
            onAccept={handleAcceptInvite}
            onReject={handleRejectInvite}
            isAccepting={isAccepting}
            isRejecting={isRejecting}
          />

          {/* Horizontal Projects Rail */}
          <section className="pt-2">
            <RecentProjectsRail />
          </section>

          {/* Workspaces List Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-3">
              <LayoutGrid className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Your Workspaces
              </h2>
            </div>
            
            <WorkspaceGrid
              workspaces={workspaces}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onRetry={refetch}
              onCreateClick={() => setIsCreateOpen(true)}
            />
          </section>

        </main>

        {/* Create Workspace Dialog */}
        <CreateWorkspaceDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      </div>
    </SidebarLayout>
  );
};
