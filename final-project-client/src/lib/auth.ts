import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { registerTokenGetter } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await api.get('/auth/me');
          const authUser = res.data.user || res.data.data || res.data;
          const { id, _id, name, email, phone, role } = authUser;
          set({
            user: { id: id || _id, name, email, phone, role },
            isAuthenticated: true,
          });
        } catch {
          // Token invalid/expired — clear auth
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'car-import-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Register token getter so Axios can attach it without circular import
registerTokenGetter(() => useAuthStore.getState().token);
