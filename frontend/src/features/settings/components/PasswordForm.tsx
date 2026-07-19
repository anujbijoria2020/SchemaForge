import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

// NOTE FOR BACKEND COUNTERPART:
// GAP IDENTIFIED: The backend currently lacks an endpoint to change the password for authenticated users.
// Until this endpoint is implemented (e.g. POST/PATCH /api/auth/change-password),
// this form is intentionally disabled and stubbed with a "Coming soon" notice.

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordFormSchema>;

export const PasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (_data: PasswordFormData) => {
    // Stubbed action pending backend API addition
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-primary">
          Change Password
        </h2>
        <p className="text-xs text-secondary">
          Ensure your account is using a long, secure password.
        </p>
      </div>

      {/* Flag warning box */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-sm">
        <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-primary">Backend Sync Pending</p>
          <p className="text-[11px] text-secondary leading-relaxed">
            Password modification is currently in staging. This form is disabled pending the change-password endpoint integration.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Current Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            disabled={true}
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
            New Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            disabled={true}
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Confirm New Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            disabled={true}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Disabled submit button with custom tooltip on hover */}
        <div className="pt-2 flex justify-start">
          <div className="relative group">
            <Button
              type="submit"
              disabled={true/* explicit disabled */}
              className="flex items-center gap-2 font-semibold cursor-not-allowed opacity-50"
            >
              Update Password
            </Button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 bg-surface border border-border-subtle text-secondary text-xs rounded-sm py-1.5 px-3 z-50 whitespace-nowrap shadow-lg">
              <HelpCircle className="h-3.5 w-3.5 text-accent" />
              <span>Coming soon (Backend gap)</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
