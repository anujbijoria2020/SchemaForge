import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Shield } from 'lucide-react';
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
import { useInviteMember } from '../api/members';
import { ApiError } from '../../../shared/lib/api-client';

const inviteFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer', 'commenter'], {
    required_error: 'Role is required',
  }),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface InviteDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const InviteDialog: React.FC<InviteDialogProps> = ({
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { mutate: inviteMember, isPending } = useInviteMember(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'editor',
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      reset({
        email: '',
        role: 'editor',
      });
    }
  }, [open, reset]);

  const onSubmit = (data: InviteFormData) => {
    inviteMember(data, {
      onSuccess: () => {
        toast('Invitation sent successfully!', { variant: 'success' });
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.errors && Array.isArray(err.errors)) {
            err.errors.forEach((fieldErr: any) => {
              if (fieldErr.field) {
                setError(fieldErr.field as keyof InviteFormData, {
                  type: 'server',
                  message: fieldErr.message,
                });
              }
            });
          }
          toast(err.message || 'Failed to send invitation.', { variant: 'danger' });
        } else {
          toast('Network error. Please try again.', { variant: 'danger' });
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to collaborate on your database schemas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              disabled={isPending}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Workspace Role
              </label>
            </div>
            <div className="relative">
              <select
                disabled={isPending}
                className="w-full bg-surface border border-border text-primary text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-accent py-2 px-3 appearance-none capitalize cursor-pointer"
                {...register('role')}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-secondary">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            {errors.role && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Dialog Buttons */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="font-semibold">
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Inviting...</span>
                </div>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
