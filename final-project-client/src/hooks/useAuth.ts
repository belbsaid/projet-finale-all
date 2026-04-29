'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/lib/auth';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.post('/auth/login', { email, password });
        const { token: jwt, user: userData } = res.data;
        const authUser: AuthUser = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
        };
        setAuth(authUser, jwt);
        toast.success(`Bienvenue, ${authUser.name} !`);
        return authUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur de connexion';
        toast.error(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  const register = useCallback(
    async (data: { name: string; email: string; phone: string; password: string }) => {
      setIsLoading(true);
      try {
        const res = await api.post('/auth/register', data);
        const { token: jwt, user: userData } = res.data;
        const authUser: AuthUser = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
        };
        setAuth(authUser, jwt);
        toast.success(`Compte créé avec succès. Bienvenue, ${authUser.name} !`);
        return authUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription";
        toast.error(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    storeLogout();
    toast.success('Déconnexion réussie');
  }, [storeLogout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };
}
