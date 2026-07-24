import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import { useRegisterMutation } from '../api/auth';
import { ApiError } from '../../../shared/lib/api-client';

const registerFormSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export const RegisterForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: registerUser, isPending } = useRegisterMutation();

  const redirectTo = searchParams.get('redirectTo') || '/app';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data, {
      onSuccess: () => {
        toast('Account created successfully!', { variant: 'success' });
        navigate(redirectTo);
      },

      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.errors && Array.isArray(err.errors)) {
            err.errors.forEach((fieldErr: any) => {
              if (fieldErr.field) {
                setError(fieldErr.field as keyof RegisterFormData, {
                  type: 'server',
                  message: fieldErr.message,
                });
              }
            });
          }
          toast(err.message || 'Registration failed. Please try again.', { variant: 'danger' });
        } else {
          toast('Network error. Please try again.', { variant: 'danger' });
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Full Name</label>
        <Input
          type="text"
          placeholder="John Doe"
          disabled={isPending}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-sm text-red-400 mt-1 font-medium">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Email Address</label>
        <Input
          type="email"
          placeholder="name@example.com"
          disabled={isPending}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-400 mt-1 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-400 mt-1 font-medium">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full font-semibold cursor-pointer" disabled={isPending}>
        {isPending ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Creating Account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </Button>

      <div className="flex items-center gap-3 w-full my-4 text-xs text-slate-500">
        <div className="h-px bg-border-subtle flex-1" />
        <span>or continue with</span>
        <div className="h-px bg-border-subtle flex-1" />
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-3 bg-background hover:bg-surface border border-border-subtle rounded-lg text-primary font-semibold py-2.5 w-full transition-all cursor-pointer text-sm"
        onClick={() => toast('Google registration is not configured in this demo.', { variant: 'info' })}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google</span>
      </button>

      <div className="text-center pt-2">
        <p className="text-xs text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};
