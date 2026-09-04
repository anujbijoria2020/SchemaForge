import * as React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../shared/components/ui/Toast';
import { router } from './router';
import { useAuthStore } from '../features/auth/store/authStore';
import { apiRequest } from '../shared/lib/api-client';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { ThemeProvider } from './providers/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedRefreshToken = localStorage.getItem('sf_refresh_token');

        // 1. Try to refresh the token using cookie or fallback in body
        const refreshRes = await apiRequest<{ data: { accessToken: string; refreshToken?: string } }>('/auth/refresh', {
          method: 'POST',
          data: storedRefreshToken ? { refreshToken: storedRefreshToken } : undefined,
        });
        const accessToken = refreshRes.data.accessToken;

        if (refreshRes.data.refreshToken) {
          localStorage.setItem('sf_refresh_token', refreshRes.data.refreshToken);
        }

        // 2. Fetch current user data using the new token
        const meRes = await apiRequest<{ data: { user: { id: string; email: string; displayName: string } } }>('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 3. Set the authenticated state
        setUser(meRes.data.user, accessToken);
      } catch (err) {
        // If anything fails, user is not authenticated
        localStorage.removeItem('sf_refresh_token');
        console.error('Auth initialization failed:', err);
        setUser(null, null);
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [setUser, setInitializing]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
