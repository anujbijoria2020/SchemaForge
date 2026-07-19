import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Settings, AlertTriangle, AlertCircle } from 'lucide-react';
import { useWorkspace, useRenameWorkspace, useDeleteWorkspace } from '../api/workspaces';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import { ApiError } from '../../../shared/lib/api-client';

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

export const WorkspaceSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [confirmName, setConfirmName] = React.useState('');

  const {
    data: workspace,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspace(id);

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
      name: '',
      slug: '',
      description: '',
    },
  });

  const nameValue = watch('name');

  // Reset form when workspace data is loaded
  React.useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description || '',
      });
    }
  }, [workspace, reset]);

  // Auto-generate slug from name if slug hasn't been touched
  React.useEffect(() => {
    if (workspace && !dirtyFields.slug && nameValue && nameValue !== workspace.name) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, dirtyFields.slug, setValue, workspace]);

  const onRenameSubmit = (data: RenameFormData) => {
    if (!workspace) return;
    
    renameWorkspace(
      { id: workspace.id, ...data },
      {
        onSuccess: () => {
          toast('Workspace settings updated successfully!', { variant: 'success' });
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

  const onDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    if (confirmName !== workspace.name) return;

    deleteWorkspace(workspace.id, {
      onSuccess: () => {
        toast('Workspace deleted successfully.', { variant: 'success' });
        navigate('/app');
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : 'Failed to delete workspace.';
        toast(message, { variant: 'danger' });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans flex flex-col pb-16 animate-pulse">
        <div className="border-b border-border-subtle bg-surface/30 h-12 py-3 px-6 sm:px-8" />
        <main className="max-w-4xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8">
          <div className="space-y-3">
            <div className="h-6 w-48 bg-border rounded-xs" />
            <div className="h-4 w-96 bg-border rounded-xs" />
          </div>
          <div className="h-64 bg-border/20 border border-border-subtle rounded-sm" />
        </main>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans flex items-center justify-center p-6 flex-col">
        <div className="border border-destructive/30 bg-surface/50 max-w-lg w-full rounded-sm p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-md font-bold">Failed to load workspace</h3>
              <p className="text-xs text-secondary mt-0.5">
                {error?.message || 'An error occurred loading the workspace settings.'}
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

      {/* Sub-Bar */}
      <div className="border-b border-border-subtle bg-surface/10 py-3 px-6 sm:px-8">
        <div className="max-w-4xl w-full mx-auto">
          <Link
            to={`/app/workspaces/${workspace.id}`}
            className="text-xs text-secondary hover:text-primary transition-colors duration-150 flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {workspace.name}
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8 z-10 flex-1">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-border-subtle/40 pb-6">
          <div className="h-9 w-9 bg-accent rounded-sm flex items-center justify-center shadow-md shadow-accent/20">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">
              Workspace Settings
            </h1>
            <p className="text-xs text-secondary">
              Update details and manage settings for{' '}
              <span className="font-semibold text-primary">{workspace.name}</span>.
            </p>
          </div>
        </div>

        {/* Settings Content Grid */}
        <div className="space-y-8">
          
          {/* Rename Section */}
          <section className="bg-surface/30 border border-border-subtle rounded-sm p-6 sm:p-8 backdrop-blur-xs">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-md font-bold text-primary">General Profile</h2>
                <p className="text-xs text-secondary">Change the naming, slug, and descriptions of this workspace.</p>
              </div>

              <form onSubmit={handleSubmit(onRenameSubmit)} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    Workspace Name
                  </label>
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
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    Workspace Slug
                  </label>
                  <Input
                    placeholder="e.g. acme-corp"
                    disabled={isRenamePending}
                    {...register('slug')}
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.slug.message}</p>
                  )}
                  <p className="text-[10px] text-secondary">
                    Used in URL paths: /app/workspaces/{watch('slug') || 'your-slug'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Database models for client microservices"
                    disabled={isRenamePending}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.description.message}</p>
                  )}
                </div>

                <div className="pt-2">
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
                </div>
              </form>
            </div>
          </section>

          {/* Danger Zone Section */}
          <section className="bg-destructive/5 border border-destructive/25 rounded-sm p-6 sm:p-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-md font-bold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Danger Zone
                </h2>
                <p className="text-xs text-secondary">
                  Irreversible actions that will affect this workspace and all connected data.
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="bg-destructive/10 border border-destructive/20 rounded-sm p-4 text-xs text-secondary leading-relaxed">
                  <p className="font-semibold text-primary mb-1">Warning:</p>
                  Deleting <span className="font-semibold text-primary">{workspace.name}</span> is permanent. 
                  This will destroy all database schemas, visual canvas models, indexes, and history snapshots inside this workspace.
                </div>

                <form onSubmit={onDeleteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider block">
                      To confirm deletion, type the exact name <span className="text-primary font-bold">"{workspace.name}"</span> below:
                    </label>
                    <Input
                      placeholder={workspace.name}
                      value={confirmName}
                      onChange={(e) => setConfirmName(e.target.value)}
                      disabled={isDeletePending}
                      className="border-destructive/30 focus:border-destructive focus:ring-destructive"
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={confirmName !== workspace.name || isDeletePending}
                      className="w-full sm:w-auto font-semibold"
                    >
                      {isDeletePending ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Deleting Workspace...</span>
                        </div>
                      ) : (
                        'Delete Workspace Forever'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};
