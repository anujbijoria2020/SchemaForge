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
import { useCreateWorkspace } from '../api/workspaces';
import { ApiError } from '../../../shared/lib/api-client';

const workspaceFormSchema = z.object({
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

type WorkspaceFormData = z.infer<typeof workspaceFormSchema>;

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (workspace: any) => void;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const nameValue = watch('name');

  // Auto-generate slug from name if slug hasn't been touched
  React.useEffect(() => {
    if (!dirtyFields.slug && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
        .trim()
        .replace(/[\s_]+/g, '-')      // replace spaces and underscores with dashes
        .replace(/-+/g, '-')          // replace multiple dashes
        .replace(/^-+|-+$/g, '');     // trim leading/trailing dashes
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, dirtyFields.slug, setValue]);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        slug: '',
        description: '',
      });
    }
  }, [open, reset]);

  const onSubmit = (data: WorkspaceFormData) => {
    createWorkspace(data, {
      onSuccess: (res) => {
        toast('Workspace created successfully!', { variant: 'success' });
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(res.data.workspace);
        }
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.errors && Array.isArray(err.errors)) {
            err.errors.forEach((fieldErr: any) => {
              if (fieldErr.field) {
                setError(fieldErr.field as keyof WorkspaceFormData, {
                  type: 'server',
                  message: fieldErr.message,
                });
              }
            });
          }
          toast(err.message || 'Failed to create workspace.', { variant: 'danger' });
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
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Workspaces are org/team boundaries that hold your database schema projects and members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Workspace Name</label>
            <Input
              placeholder="e.g. Acme Corporation"
              disabled={isPending}
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
              disabled={isPending}
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
                'Create Workspace'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
