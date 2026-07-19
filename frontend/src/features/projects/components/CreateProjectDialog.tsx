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
import { useCreateProject } from '../api/projects';
import { ApiError } from '../../../shared/lib/api-client';

const projectFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  dialect: z.enum(['postgresql', 'mysql', 'sqlite', 'mssql']),
  isPublic: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface CreateProjectDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (project: any) => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { mutate: createProject, isPending } = useCreateProject(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      dialect: 'postgresql',
      isPublic: false,
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        description: '',
        dialect: 'postgresql',
        isPublic: false,
      });
    }
  }, [open, reset]);

  const onSubmit = (data: any) => {
    createProject(data, {
      onSuccess: (project) => {
        toast('Project created successfully!', { variant: 'success' });
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(project);
        }
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.errors && Array.isArray(err.errors)) {
            err.errors.forEach((fieldErr: any) => {
              if (fieldErr.field) {
                setError(fieldErr.field as keyof ProjectFormData, {
                  type: 'server',
                  message: fieldErr.message,
                });
              }
            });
          }
          toast(err.message || 'Failed to create project.', { variant: 'danger' });
        } else {
          toast('Network error. Please try again.', { variant: 'danger' });
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Projects hold a single visual database schema design. Choose a name and your database dialect.
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
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Database Dialect</label>
            <select
              disabled={isPending}
              className="flex h-10 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-sans text-primary transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent focus:ring-1 focus:ring-accent focus:bg-surface cursor-pointer"
              {...register('dialect')}
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
              <option value="mssql">SQL Server (MSSQL)</option>
            </select>
            {errors.dialect && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.dialect.message}</p>
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
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
