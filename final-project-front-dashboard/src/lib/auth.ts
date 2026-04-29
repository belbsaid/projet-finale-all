import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    },
  ),
);
