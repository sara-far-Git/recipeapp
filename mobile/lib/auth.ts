import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
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
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    await SecureStore.setItemAsync("token", data.access_token);
    set({ token: data.access_token });
    const { data: user } = await usersApi.getMe();
    set({ user, isLoading: false });
  },

  register: async (regData) => {
    await authApi.register(regData);
    const { data } = await authApi.login(regData.email, regData.password);
    await SecureStore.setItemAsync("token", data.access_token);
    set({ token: data.access_token });
    const { data: user } = await usersApi.getMe();
    set({ user, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        set({ isLoading: false });
        return;
      }
      set({ token });
      const { data } = await usersApi.getMe();
      set({ user: data, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync("token");
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
