import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import { useLoginMutation } from '../api/auth';
import { ApiError } from '../../../shared/lib/api-client';

const loginFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        toast('Logged in successfully!', { variant: 'success' });
        navigate('/app');
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.errors && Array.isArray(err.errors)) {
            err.errors.forEach((fieldErr: any) => {
              if (fieldErr.field) {
                setError(fieldErr.field as keyof LoginFormData, {
                  type: 'server',
                  message: fieldErr.message,
                });
              }
            });
          }
          toast(err.message || 'Login failed. Please try again.', { variant: 'danger' });
        } else {
          toast('Network error. Please try again.', { variant: 'danger' });
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Password</label>
        </div>
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
            <span>Signing In...</span>
          </div>
        ) : (
          'Sign In'
        )}
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
};
