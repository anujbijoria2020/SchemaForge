import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

// NOTE FOR BACKEND COUNTERPART:
// GAP IDENTIFIED: The backend currently lacks an endpoint to update profile details (e.g. displayName, email).
// Until this endpoint is implemented (e.g., PATCH /api/users/profile or PATCH /api/auth/me), 
// this form is intentionally disabled and stubbed with a "Coming soon" notice.

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export const ProfileForm: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
    },
  });

  const onSubmit = (_data: ProfileFormData) => {
    // Stubbed action pending backend API addition
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          Profile Information
        </h2>
        <p className="text-xs text-secondary">
          Update your public facing display name and email address.
        </p>
      </div>

      {/* Flag warning box */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-sm">
        <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-primary">Backend Sync Pending</p>
          <p className="text-[11px] text-secondary leading-relaxed">
            Profile modification is currently in staging. This form is disabled pending the profile-update endpoint integration.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Display Name
          </label>
          <Input
            placeholder="e.g. Jane Doe"
            disabled={true}
            {...register('displayName')}
          />
          {errors.displayName && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="e.g. jane.doe@example.com"
            disabled={true}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Disabled submit button with custom tooltip on hover */}
        <div className="pt-2 flex justify-start">
          <div className="relative group">
            <Button
              type="submit"
              disabled={true}
              className="flex items-center gap-2 font-semibold cursor-not-allowed opacity-50"
            >
              Save Profile
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
