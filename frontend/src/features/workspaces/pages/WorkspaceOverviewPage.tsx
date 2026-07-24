import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, AlertTriangle } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useWorkspace } from '../api/workspaces';
import { SidebarLayout } from '../../../shared/components/SidebarLayout';
import { Button } from '../../../shared/components/ui/Button';
import { ProjectGrid } from '../../projects/components/ProjectGrid';
import { CreateProjectDialog } from '../../projects/components/CreateProjectDialog';

export const WorkspaceOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);

  const [showArchived, setShowArchived] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Set active workspace ID when navigating to this workspace
  React.useEffect(() => {
    if (id) {
      setActiveWorkspaceId(id);
    }
  }, [id, setActiveWorkspaceId]);

  const {
    data: workspace,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspace(id);

  // Loading skeleton matching layout exactly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans flex flex-col pb-16 animate-pulse">
        {/* Header Skeleton */}
        <div className="border-b border-border-subtle bg-surface/30 py-6 px-6 sm:px-8 h-32 flex flex-col justify-between">
          <div className="h-8 w-1/3 bg-border rounded-xs" />
          <div className="h-4 w-1/2 bg-border rounded-xs" />
        </div>

        {/* Content Skeleton */}
        <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8">
          <div className="flex justify-between items-center h-10">
            <div className="h-6 w-36 bg-border rounded-xs" />
            <div className="h-6 w-48 bg-border rounded-xs" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-sm border border-border-subtle bg-surface/50 h-44 p-6 space-y-4">
                <div className="h-6 w-1/2 bg-border rounded-xs" />
                <div className="h-4 w-5/6 bg-border rounded-xs" />
                <div className="h-4 w-2/3 bg-border rounded-xs" />
                <div className="h-4 w-1/4 bg-border rounded-xs" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error boundary showing retry card
  if (isError || !workspace) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans flex items-center justify-center p-6 flex-col">
        <div className="border border-destructive/30 bg-surface/50 max-w-lg w-full rounded-sm p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-md font-bold">Workspace not found</h3>
              <p className="text-xs text-secondary mt-0.5">
                {error?.message || 'The workspace does not exist or you do not have permission.'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-border-subtle/20 pt-4">
            <Button variant="secondary" size="sm" onClick={() => navigate('/app')}>
              Go to Dashboard
            </Button>
            <Button variant="primary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout workspaceId={id} workspace={workspace}>
      <div className="relative pb-16 w-full flex-1">
        {/* Background Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />

        {/* Workspace Info Page Header */}
        <div className="border-b border-border-subtle bg-surface/30 backdrop-blur-xs py-6 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-primary">
                  {workspace.name}
                </h1>
                <span className="text-[10px] text-accent/80 bg-accent/10 border border-accent/15 rounded-xs px-2 py-0.5 font-medium font-mono">
                  /{workspace.slug}
                </span>
              </div>
              {workspace.description && (
                <p className="text-sm text-secondary max-w-2xl leading-relaxed">
                  {workspace.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 self-start md:self-center">
              <span className="text-xs text-secondary font-medium mr-2">Show Archived</span>
              <button
                onClick={() => setShowArchived((prev) => !prev)}
                role="switch"
                aria-checked={showArchived}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer ${
                  showArchived ? 'bg-accent' : 'bg-border-subtle'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                    showArchived ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8 z-10 relative">
          {/* Section Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Database Schemas
              </h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1 font-semibold shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Button>
          </div>

          {/* Project cards grid */}
          {id && (
            <ProjectGrid
              workspaceId={id}
              showArchived={showArchived}
              onCreateClick={() => setIsCreateOpen(true)}
            />
          )}
        </main>

        {id && (
          <CreateProjectDialog
            workspaceId={id}
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        )}
      </div>
    </SidebarLayout>
  );
};
