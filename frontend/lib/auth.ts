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

let authRequestId = 0;

const persistSession = (token: string, user: User) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const finishLogin = async (accessToken: string, set: (state: Partial<AuthState>) => void) => {
  const requestId = ++authRequestId;
  localStorage.setItem("token", accessToken);
  set({ token: accessToken, isLoading: true });
  try {
    const { data: user } = await usersApi.getMe({ skipAuthRedirect: true });
    if (requestId !== authRequestId || localStorage.getItem("token") !== accessToken) {
      return;
    }
    persistSession(accessToken, user);
    set({ user, token: accessToken, isLoading: false });
  } catch (error) {
    if (requestId !== authRequestId) {
      return;
    }
    clearSession();
    set({ user: null, token: null, isLoading: false });
    throw error;
  }
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
    authRequestId += 1;
    clearSession();
    set({ user: null, token: null, isLoading: false });
  },

  loadUser: async () => {
    const requestId = ++authRequestId;
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }
    try {
      const { data } = await usersApi.getMe();
      if (requestId !== authRequestId || localStorage.getItem("token") !== token) {
        return;
      }
      localStorage.setItem("user", JSON.stringify(data));
      set({ user: data, token, isLoading: false });
    } catch {
      if (requestId === authRequestId) {
        clearSession();
        set({ user: null, token: null, isLoading: false });
      }
    }
  },
}));
