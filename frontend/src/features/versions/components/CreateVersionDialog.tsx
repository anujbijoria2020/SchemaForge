import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '../../../shared/components/ui/Button';

const versionFormSchema = z.object({
  label: z
    .string()
    .min(2, 'Label must be at least 2 characters')
    .max(100, 'Label must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
});

type VersionFormValues = z.infer<typeof versionFormSchema>;

interface CreateVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { label: string; description: string | null }) => void;
  isPending: boolean;
}

export const CreateVersionDialog: React.FC<CreateVersionDialogProps> = ({
  open,
  onOpenChange,
  onCreate,
  isPending,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VersionFormValues>({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      label: '',
      description: '',
    },
  });

  // Reset form values on open/close
  React.useEffect(() => {
    if (open) {
      reset({ label: '', description: '' });
    }
  }, [open, reset]);

  const onSubmit = (values: VersionFormValues) => {
    onCreate({
      label: values.label,
      description: values.description || null,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-[#080B14]/70 backdrop-blur-xs z-50 transition-opacity duration-150 animate-fade-in" />

        {/* Content */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0F1420] border border-[#1E293B]/80 rounded-sm shadow-2xl z-50 flex flex-col overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-primary">Create Schema Snapshot</h3>
              <p className="text-[10px] text-secondary">Save a permanent restore checkpoint of this schema.</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 rounded-sm flex items-center justify-center text-secondary hover:text-primary hover:bg-white/5 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 text-xs">
            {/* Label input */}
            <div className="space-y-1.5">
              <label htmlFor="label" className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                Snapshot Label <span className="text-red-500">*</span>
              </label>
              <input
                id="label"
                type="text"
                placeholder="e.g. v1.0-release, pre-auth-changes"
                {...register('label')}
                className="w-full h-9 rounded-sm border border-border/80 bg-[#080B14] px-3 py-1.5 text-primary outline-none focus:border-accent/80 transition-colors font-sans text-xs"
                disabled={isPending}
                autoFocus
              />
              {errors.label && (
                <p className="text-[10px] text-red-500 font-medium">{errors.label.message}</p>
              )}
            </div>

            {/* Description input */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Brief summary of changes in this snapshot..."
                {...register('description')}
                className="w-full rounded-sm border border-border/80 bg-[#080B14] px-3 py-1.5 text-primary outline-none focus:border-accent/80 transition-colors font-sans text-xs resize-none"
                disabled={isPending}
              />
              {errors.description && (
                <p className="text-[10px] text-red-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40 mt-6">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isPending}
                className="h-8 cursor-pointer shadow-sm shadow-accent/25"
              >
                {isPending ? 'Saving...' : 'Save Checkpoint'}
              </Button>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
