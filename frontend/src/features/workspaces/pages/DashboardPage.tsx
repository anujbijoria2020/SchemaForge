import * as React from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useWorkspaces } from '../api/workspaces';
import { useMyInvitations, useAcceptInvitation, useRejectInvitation } from '../api/members';
import { UserPendingInvitesList } from '../components/UserPendingInvitesList';
import { WorkspaceGrid } from '../components/WorkspaceGrid';
import { RecentProjectsRail } from '../components/RecentProjectsRail';
import { CreateWorkspaceDialog } from '../components/CreateWorkspaceDialog';
import { apiRequest } from '../../../shared/lib/api-client';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { LogOut, Database, Plus, LayoutGrid, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore backend logout errors, proceed to clear client auth
    } finally {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary font-sans flex flex-col pb-16 relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      {/* Premium Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-accent rounded-sm flex items-center justify-center shadow-md shadow-accent/20">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">SchemaForge</h1>
            <p className="text-[10px] text-secondary">Vednix Product Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs text-secondary font-medium mr-1">
            Logged in as <span className="text-primary font-semibold">{user?.displayName || user?.email}</span>
          </span>
          <ThemeToggle />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/settings/profile')}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-accent" />
            Settings
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-2 font-semibold cursor-pointer">
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-12 z-10 flex-1">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
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
  );
};
