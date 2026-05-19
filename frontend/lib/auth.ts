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

const persistSession = (token: string, user: User) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const finishLogin = async (accessToken: string, set: (state: Partial<AuthState>) => void) => {
  localStorage.setItem("token", accessToken);
  set({ token: accessToken, isLoading: true });
  const { data: user } = await usersApi.getMe();
  persistSession(accessToken, user);
  set({ user, token: accessToken, isLoading: false });
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await authApi.login(email.trim(), password);
    await finishLogin(data.access_token, set);
  },

  register: async (regData) => {
    const payload = {
      username: regData.username.trim(),
      email: regData.email.trim(),
      password: regData.password,
      full_name: regData.full_name?.trim() || undefined,
    };
    await authApi.register(payload);
    const { data } = await authApi.login(payload.email, payload.password);
    await finishLogin(data.access_token, set);
  },

  loginWithGoogle: async (idToken) => {
    const { data } = await authApi.googleLogin(idToken);
    await finishLogin(data.access_token, set);
  },

  logout: () => {
    clearSession();
    set({ user: null, token: null, isLoading: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await usersApi.getMe();
      localStorage.setItem("user", JSON.stringify(data));
      set({ user: data, token, isLoading: false });
    } catch {
      clearSession();
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
