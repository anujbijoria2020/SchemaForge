import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { DashboardPage } from '../../features/workspaces/pages/DashboardPage';
import { WorkspaceOverviewPage } from '../../features/workspaces/pages/WorkspaceOverviewPage';
import { MembersPage } from '../../features/workspaces/pages/MembersPage';
import { AcceptInvitationPage } from '../../features/workspaces/pages/AcceptInvitationPage';
import { Playground } from '../Playground';

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
        element: <DashboardPage />,
      },
      {
        path: 'workspaces/:id',
        element: <WorkspaceOverviewPage />,
      },
      {
        path: 'workspaces/:id/members',
        element: <MembersPage />,
      },
    ],
  },
  // Public invitation acceptance route
  {
    path: '/invitations/:token',
    element: <AcceptInvitationPage />,
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
