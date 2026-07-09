import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm font-medium text-secondary animate-pulse font-sans">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
