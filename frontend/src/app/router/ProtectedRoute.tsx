import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Database } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080B14] text-primary relative overflow-hidden select-none">
        {/* Background Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

        <div className="flex flex-col items-center gap-4 z-10">
          <div className="h-14 w-14 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-accent shadow-lg shadow-accent/15 animate-pulse">
            <Database className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-secondary animate-pulse font-sans tracking-wide">
            Initializing session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
