import * as React from 'react';
import { Link } from 'react-router-dom';
import { Folder, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import type { Workspace } from '../api/workspaces';

interface WorkspaceGridProps {
  workspaces: Workspace[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
  onRetry: () => void;
  onCreateClick: () => void;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  workspaces,
  isLoading,
  isError,
  error,
  onRetry,
  onCreateClick,
}) => {
  // Skeleton count (grid matches final layout)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-sm border border-border-subtle bg-surface/50 h-40 p-6 flex flex-col justify-between animate-pulse">
            <div className="space-y-3">
              <div className="h-6 w-2/3 bg-border rounded-xs" />
              <div className="h-4 w-5/6 bg-border rounded-xs" />
              <div className="h-4 w-1/2 bg-border rounded-xs" />
            </div>
            <div className="h-4 w-1/4 bg-border rounded-xs self-end" />
          </div>
        ))}
      </div>
    );
  }

  // Error state with retry action
  if (isError) {
    return (
      <Card className="border-destructive/30 bg-surface/50 max-w-2xl mx-auto my-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-md">Failed to load workspaces</CardTitle>
            <CardDescription className="text-secondary mt-0.5">
              {error?.message || 'A network error occurred while fetching your workspaces.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-secondary leading-relaxed">
            Please check your connection and try again. If the problem persists, contact support.
          </p>
        </CardContent>
        <div className="flex justify-end p-6 pt-0 border-t border-border-subtle/20 mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry} className="cursor-pointer">
            Retry Connection
          </Button>
        </div>
      </Card>
    );
  }

  // Empty state first-run CTA
  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-subtle rounded-sm bg-surface/20 max-w-2xl mx-auto my-8 space-y-6">
        <div className="h-16 w-16 bg-accent/5 rounded-full flex items-center justify-center border border-accent/15">
          <Folder className="h-8 w-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary">No Workspaces Found</h3>
          <p className="text-sm text-secondary max-w-md">
            SchemaForge workspaces represent your organization or team boundaries. Get started by creating your first workspace.
          </p>
        </div>
        <Button variant="primary" onClick={onCreateClick} className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4" />
          Create First Workspace
        </Button>
      </div>
    );
  }

  // Grid list of workspaces
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((workspace) => (
        <Link
          key={workspace.id}
          to={`/app/workspaces/${workspace.id}`}
          className="group block rounded-sm border border-border-subtle bg-surface hover:border-accent/40 transition-all duration-200 shadow-md p-6 h-40 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <h3 className="text-md font-bold text-primary group-hover:text-accent transition-colors duration-150 truncate">
              {workspace.name}
            </h3>
            <p className="text-xs text-secondary line-clamp-2 mt-1">
              {workspace.description || 'No description provided.'}
            </p>
            <span className="inline-block text-[10px] text-accent/80 bg-accent/10 border border-accent/15 rounded-xs px-2 py-0.5 mt-2 font-medium">
              /{workspace.slug}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-secondary border-t border-border-subtle/20 pt-4 mt-2">
            <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1 text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Open <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
