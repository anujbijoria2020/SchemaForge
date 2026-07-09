import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: User | null, accessToken: string | null) => void;
  setInitializing: (isInitializing: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  setUser: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: !!user,
    }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
