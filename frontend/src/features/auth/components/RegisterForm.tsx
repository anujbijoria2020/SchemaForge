import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
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
  const { mutate: registerUser, isPending } = useRegisterMutation();

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
        navigate('/app');
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
          <p className="text-xs text-destructive mt-1 font-medium">{errors.displayName.message}</p>
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
          <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
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
          <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
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
