import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Edit, AlertCircle, Users } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../shared/components/ui/Dialog';
import { type Workspace, useRenameWorkspace, useDeleteWorkspace } from '../api/workspaces';
import { ApiError } from '../../../shared/lib/api-client';

interface WorkspaceHeaderProps {
  workspace: Workspace;
}

const renameFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters long')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase alphanumeric characters and dashes'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
});

type RenameFormData = z.infer<typeof renameFormSchema>;

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ workspace }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  
  const { mutate: renameWorkspace, isPending: isRenamePending } = useRenameWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeletePending } = useDeleteWorkspace();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<RenameFormData>({
    resolver: zodResolver(renameFormSchema),
    defaultValues: {
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description || '',
    },
  });

  const nameValue = watch('name');

  // Auto-generate slug from name if slug hasn't been touched
  React.useEffect(() => {
    if (!dirtyFields.slug && nameValue && nameValue !== workspace.name) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, dirtyFields.slug, setValue, workspace.name]);

  // Reset form when dialog opens with current workspace values
  React.useEffect(() => {
    if (isRenameOpen) {
      reset({
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description || '',
      });
    }
  }, [isRenameOpen, reset, workspace]);

  const onRenameSubmit = (data: RenameFormData) => {
    renameWorkspace(
      { id: workspace.id, ...data },
      {
        onSuccess: () => {
          toast('Workspace renamed successfully!', { variant: 'success' });
          setIsRenameOpen(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.errors && Array.isArray(err.errors)) {
              err.errors.forEach((fieldErr: any) => {
                if (fieldErr.field) {
                  setError(fieldErr.field as keyof RenameFormData, {
                    type: 'server',
                    message: fieldErr.message,
                  });
                }
              });
            }
            toast(err.message || 'Failed to rename workspace.', { variant: 'danger' });
          } else {
            toast('Network error. Please try again.', { variant: 'danger' });
          }
        },
      }
    );
  };

  const onDeleteConfirm = () => {
    deleteWorkspace(workspace.id, {
      onSuccess: () => {
        toast('Workspace deleted successfully.', { variant: 'success' });
        setIsDeleteOpen(false);
        navigate('/app');
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : 'Failed to delete workspace.';
        toast(message, { variant: 'danger' });
      },
    });
  };

  return (
    <div className="border-b border-border-subtle bg-surface/30 backdrop-blur-xs py-6 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Workspace Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-primary">
              {workspace.name}
            </h1>
            <span className="text-[10px] text-accent/80 bg-accent/10 border border-accent/15 rounded-xs px-2 py-0.5 font-medium">
              /{workspace.slug}
            </span>
          </div>
          {workspace.description && (
            <p className="text-sm text-secondary max-w-2xl leading-relaxed">
              {workspace.description}
            </p>
          )}
        </div>

        {/* Workspace Operations */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/app/workspaces/${workspace.id}/members`)}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-accent" />
            Members
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsRenameOpen(true)}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
            Rename
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>

      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Workspace</DialogTitle>
            <DialogDescription>
              Update your workspace name, slug identifier, or description details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onRenameSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Workspace Name</label>
              <Input
                placeholder="e.g. Acme Corporation"
                disabled={isRenamePending}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Workspace Slug</label>
              <Input
                placeholder="e.g. acme-corp"
                disabled={isRenamePending}
                {...register('slug')}
              />
              {errors.slug && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.slug.message}</p>
              )}
              <p className="text-[10px] text-secondary">
                Used in URL addresses: /app/workspaces/{watch('slug') || 'your-slug'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Description (Optional)</label>
              <Input
                placeholder="e.g. Database schemas for Acme microservices"
                disabled={isRenamePending}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsRenameOpen(false)}
                disabled={isRenamePending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRenamePending}>
                {isRenamePending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-destructive/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Workspace
            </DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This action is permanent and cannot be undone. All projects and schemas inside this workspace will be deleted forever.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-secondary leading-relaxed bg-destructive/5 border border-destructive/15 rounded-xs p-3">
            <span className="font-semibold text-primary">Warning:</span> You are deleting <span className="font-semibold text-primary">{workspace.name}</span>. This will destroy all connected database models.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeletePending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete Forever'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
