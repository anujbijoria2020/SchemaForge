import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FolderArchive, LayoutGrid, Sparkles, Calendar, Plus, AlertTriangle } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useWorkspace } from '../api/workspaces';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { Button } from '../../../shared/components/ui/Button';

export const WorkspaceOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);

  const [showArchived, setShowArchived] = React.useState(false);

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

  // Mock static projects since CRUD is out of scope
  const mockProjects = [
    {
      id: 'proj-acme-1',
      name: 'User Management DB',
      description: 'Central users database containing profiles, oauth credentials, and permission matrices.',
      dialect: 'postgresql',
      createdAt: '2026-05-12',
      tableCount: 14,
      isArchived: false,
    },
    {
      id: 'proj-acme-2',
      name: 'Analytics Warehouse',
      description: 'OLAP data warehouse tracking site telemetry, purchase events, and session stats.',
      dialect: 'postgresql',
      createdAt: '2026-06-01',
      tableCount: 29,
      isArchived: false,
    },
    {
      id: 'proj-acme-archived',
      name: 'Legacy Billing Engine',
      description: 'Archived legacy billing structures. Replaced by Stripe billing service.',
      dialect: 'mysql',
      createdAt: '2025-01-10',
      tableCount: 8,
      isArchived: true,
    },
  ];

  const filteredProjects = mockProjects.filter((p) => !p.isArchived || showArchived);

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
    <div className="min-h-screen bg-background text-primary font-sans flex flex-col pb-16 relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      {/* Header */}
      <WorkspaceHeader workspace={workspace} />

      {/* Workspace Sub-Bar (Navigation back & toggle options) */}
      <div className="border-b border-border-subtle bg-surface/10 py-3 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/app"
            className="text-xs text-secondary hover:text-primary transition-colors duration-150 flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary font-medium">Show Archived</span>
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
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8 z-10 flex-1">
        
        {/* Section Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Database Schemas
            </h2>
          </div>
          <Button variant="secondary" size="sm" className="cursor-not-allowed opacity-60 flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`group flex flex-col justify-between rounded-sm border p-6 h-44 shadow-md bg-surface transition-all duration-200 ${
                project.isArchived
                  ? 'border-dashed border-border-subtle bg-surface/40 opacity-70'
                  : 'border-border-subtle hover:border-accent/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className={`text-md font-bold truncate transition-colors duration-150 ${
                    project.isArchived
                      ? 'text-secondary font-normal'
                      : 'text-primary group-hover:text-accent'
                  }`}>
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {project.isArchived && (
                      <span className="text-[9px] font-semibold text-secondary bg-border-subtle border border-border px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                        <FolderArchive className="h-2.5 w-2.5" />
                        Archived
                      </span>
                    )}
                    <span className="text-[10px] text-secondary font-mono uppercase tracking-wider bg-border-subtle/50 px-2 py-0.5 rounded-xs border border-border-subtle">
                      {project.dialect}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-secondary line-clamp-2 mt-1 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {/* Footer details */}
              <div className="flex items-center justify-between text-xs text-secondary border-t border-border-subtle/20 pt-4 mt-2">
                <span className="flex items-center gap-1 text-[11px]">
                  <Database className="h-3.5 w-3.5 text-accent" />
                  <span className="font-semibold text-primary">{project.tableCount}</span> tables
                </span>
                <span className="text-[11px] flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Note */}
        <div className="flex items-start gap-3 bg-surface/20 border border-border-subtle rounded-sm p-4 text-xs text-secondary leading-relaxed">
          <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-semibold text-primary mb-0.5">Project CRUD coming in the next milestone</p>
            <p>
              Designing custom tables, relational wires, and SQL schema projection is planned in Milestone 9+. You are currently viewing static database projections of the {workspace.name} workspace.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
