import { create } from "zustand";
import { authApi, usersApi } from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  recipes_count: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; full_name?: string }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem("token", data.access_token);
    set({ token: data.access_token });
    const { data: user } = await usersApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isLoading: false });
  },

  register: async (regData) => {
    await authApi.register(regData);
    const { data } = await authApi.login(regData.email, regData.password);
    localStorage.setItem("token", data.access_token);
    set({ token: data.access_token });
    const { data: user } = await usersApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isLoading: false });
  },

  loginWithGoogle: async (idToken) => {
    const { data } = await authApi.googleLogin(idToken);
    localStorage.setItem("token", data.access_token);
    set({ token: data.access_token });
    const { data: user } = await usersApi.getMe();
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await usersApi.getMe();
      set({ user: data, token, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
