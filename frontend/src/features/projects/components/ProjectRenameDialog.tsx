import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../shared/components/ui/Dialog';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import { useUpdateProject } from '../api/projects';
import { ApiError } from '../../../shared/lib/api-client';

const renameFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
});

type RenameFormData = z.infer<typeof renameFormSchema>;

interface ProjectRenameDialogProps {
  workspaceId: string;
  project: { id: string; name: string; description: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ProjectRenameDialog: React.FC<ProjectRenameDialogProps> = ({
  workspaceId,
  project,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { mutate: updateProject, isPending } = useUpdateProject(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RenameFormData>({
    resolver: zodResolver(renameFormSchema) as any,
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        description: project.description || '',
      });
    }
  }, [open, project, reset]);

  const onSubmit = (data: any) => {
    updateProject(
      {
        projectId: project.id,
        payload: data,
      },
      {
        onSuccess: () => {
          toast('Project updated successfully!', { variant: 'success' });
          onOpenChange(false);
          if (onSuccess) onSuccess();
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
            toast(err.message || 'Failed to update project.', { variant: 'danger' });
          } else {
            toast('Network error. Please try again.', { variant: 'danger' });
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Update the name and description of this visual schema project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Project Name</label>
            <Input
              placeholder="e.g. Core App Database"
              disabled={isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Description (Optional)</label>
            <Input
              placeholder="e.g. Schema design for the authentication and telemetry database"
              disabled={isPending}
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
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
  );
};
