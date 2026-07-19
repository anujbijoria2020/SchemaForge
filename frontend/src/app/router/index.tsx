import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { DashboardPage } from '../../features/workspaces/pages/DashboardPage';
import { WorkspaceOverviewPage } from '../../features/workspaces/pages/WorkspaceOverviewPage';
import { MembersPage } from '../../features/workspaces/pages/MembersPage';
import { WorkspaceSettingsPage } from '../../features/workspaces/pages/WorkspaceSettingsPage';
import { SettingsLayout } from '../../features/settings/components/SettingsLayout';
import { ProfilePage } from '../../features/settings/pages/ProfilePage';
import { AccountPage } from '../../features/settings/pages/AccountPage';
import { AcceptInvitationPage } from '../../features/workspaces/pages/AcceptInvitationPage';
import { EditorPage } from '../../features/editor/pages/EditorPage';
import { VersionHistoryPage } from '../../features/versions/pages/VersionHistoryPage';
import { NotFoundPage } from '../../shared/components/NotFoundPage';
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
        path: 'workspaces/:id/projects',
        element: <WorkspaceOverviewPage />,
      },
      {
        path: 'workspaces/:id/members',
        element: <MembersPage />,
      },
      {
        path: 'workspaces/:id/settings',
        element: <WorkspaceSettingsPage />,
      },
      {
        path: 'projects/:projectId/editor',
        element: <EditorPage />,
      },
      {
        path: 'projects/:projectId/versions',
        element: <VersionHistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="profile" replace />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'account',
            element: <AccountPage />,
          },
        ],
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
    element: <NotFoundPage />,
  },
]);
