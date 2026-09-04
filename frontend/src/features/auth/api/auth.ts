import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/lib/api-client';
import { useAuthStore } from '../store/authStore';

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string;
    };
    accessToken: string;
    refreshToken?: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string;
    };
    accessToken: string;
    refreshToken?: string;
  };
}

export const useLoginMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (credentials: Record<string, any>) => {
      return apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        data: credentials,
      });
    },
    onSuccess: (response) => {
      if (response.data.refreshToken) {
        localStorage.setItem('sf_refresh_token', response.data.refreshToken);
      }
      setUser(response.data.user, response.data.accessToken);
    },
  });
};

export const useRegisterMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (userData: Record<string, any>) => {
      return apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        data: userData,
      });
    },
    onSuccess: (response) => {
      if (response.data.refreshToken) {
        localStorage.setItem('sf_refresh_token', response.data.refreshToken);
      }
      setUser(response.data.user, response.data.accessToken);
    },
  });
};
