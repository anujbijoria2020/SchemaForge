import * as React from 'react';
import { AlertTriangle, Database } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { ProjectRenameDialog } from './ProjectRenameDialog';
import {
  useProjects,
  useArchiveProject,
  useDeleteProject,
  type Project,
} from '../api/projects';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../shared/components/ui/Dialog';

interface ProjectGridProps {
  workspaceId: string;
  showArchived: boolean;
  onCreateClick: () => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  workspaceId,
  showArchived,
  onCreateClick,
}) => {
  const { toast } = useToast();

  const {
    data: projects,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjects(workspaceId, showArchived);

  const { mutate: archiveProject } = useArchiveProject(workspaceId);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject(workspaceId);

  const [deleteProjectId, setDeleteProjectId] = React.useState<string | null>(null);
  const [renameProject, setRenameProject] = React.useState<Project | null>(null);

  const handleArchive = (projectId: string, archive: boolean) => {
    archiveProject(
      { projectId, archive },
      {
        onSuccess: () => {
          toast(
            archive ? 'Project archived successfully.' : 'Project unarchived successfully.',
            { variant: 'success' }
          );
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to update project status.', { variant: 'danger' });
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteProjectId) return;
    deleteProject(deleteProjectId, {
      onSuccess: () => {
        toast('Project deleted successfully.', { variant: 'success' });
        setDeleteProjectId(null);
      },
      onError: (err: any) => {
        toast(err.message || 'Failed to delete project.', { variant: 'danger' });
      },
    });
  };

  // Loading skeleton matching card layouts
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="rounded-sm border border-border-subtle bg-surface/30 h-44 p-6 space-y-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-1/2 bg-border rounded-xs" />
              <div className="h-4 w-1/4 bg-border rounded-xs" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-5/6 bg-border rounded-xs" />
              <div className="h-3.5 w-2/3 bg-border rounded-xs" />
            </div>
            <div className="flex justify-between items-center border-t border-border-subtle/20 pt-4 mt-2">
              <div className="h-4.5 w-1/4 bg-border rounded-xs" />
              <div className="h-4.5 w-1/4 bg-border rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error boundary showing retry card
  if (isError) {
    return (
      <div className="border border-destructive/20 bg-surface/50 rounded-sm p-8 space-y-4 max-w-md mx-auto text-center shadow-lg shadow-black/20">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <h3 className="text-md font-bold text-primary">Failed to load projects</h3>
          <p className="text-xs text-secondary">{error?.message || 'A network error occurred.'}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} className="mx-auto block">
          Retry Loading
        </Button>
      </div>
    );
  }

  // Empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="border border-dashed border-border-subtle bg-surface/10 rounded-sm p-10 text-center flex flex-col items-center justify-center space-y-4 py-16">
        <div className="h-12 w-12 rounded-full bg-accent/5 flex items-center justify-center border border-accent/15">
          <Database className="h-6 w-6 text-accent" />
        </div>
        <div className="space-y-1">
          <h3 className="text-md font-bold text-primary">No projects yet</h3>
          <p className="text-xs text-secondary max-w-sm">
            {showArchived
              ? "You don't have any archived projects in this workspace."
              : 'Create your first visual database design schema project to get started.'}
          </p>
        </div>
        {!showArchived && (
          <Button onClick={onCreateClick} size="sm" className="font-semibold shadow-md">
            Create Project
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onRename={() => setRenameProject(project)}
            onArchive={(archive) => handleArchive(project.id, archive)}
            onDelete={() => setDeleteProjectId(project.id)}
          />
        ))}
      </div>

      {/* Rename Dialog */}
      {renameProject && (
        <ProjectRenameDialog
          workspaceId={workspaceId}
          project={renameProject}
          open={!!renameProject}
          onOpenChange={(open) => !open && setRenameProject(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProjectId} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Project
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action is permanent and cannot be
              undone. All custom tables, columns, and relationships will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteProjectId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete Permanently'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
