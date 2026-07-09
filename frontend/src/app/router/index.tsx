import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { useAuthStore } from '../../features/auth/store/authStore';
import { apiRequest } from '../../shared/lib/api-client';
import { Playground } from '../Playground';

const DashboardPlaceholder = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore backend logout errors, proceed to clear client auth state
    } finally {
      logout();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-primary font-sans flex-col gap-6 p-4">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      <div className="text-center flex flex-col gap-2 z-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-secondary text-sm">
          Welcome back, <span className="text-accent font-semibold">{user?.displayName || user?.email}</span>!
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="px-5 py-2.5 bg-destructive hover:bg-destructive-hover text-white text-sm font-semibold rounded-sm shadow-md transition-colors duration-200 cursor-pointer z-10"
      >
        Sign Out
      </button>
    </div>
  );
};

export const router = createBrowserRouter([
  // Public routes wrapped in PublicRoute to redirect away if already authed
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  // Protected routes
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <DashboardPlaceholder />,
      },
    ],
  },
  // Playground route
  {
    path: '/playground',
    element: <Playground />,
  },
  // Redirect root to dashboard or login
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  // Fallback 404
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary flex-col gap-4">
        <h1 className="text-4xl font-extrabold">404</h1>
        <p className="text-secondary text-sm">Page not found</p>
        <a href="/app" className="text-accent hover:underline text-sm font-semibold">
          Go to Dashboard
        </a>
      </div>
    ),
  },
]);
