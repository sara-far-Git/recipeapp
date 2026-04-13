import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { authApi, usersApi } from "./api";

const tokenStore = {
  async get(): Promise<string | null> {
    if (Platform.OS === "web") return localStorage.getItem("token");
    return SecureStore.getItemAsync("token");
  },
  async set(value: string) {
    if (Platform.OS === "web") { localStorage.setItem("token", value); return; }
    return SecureStore.setItemAsync("token", value);
  },
  async remove() {
    if (Platform.OS === "web") { localStorage.removeItem("token"); return; }
    return SecureStore.deleteItemAsync("token");
  },
};

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
    await tokenStore.set(data.access_token);
    set({ token: data.access_token });
    const { data: user } = await usersApi.getMe();
    set({ user, isLoading: false });
  },

  register: async (regData) => {
    await authApi.register(regData);
    const { data } = await authApi.login(regData.email, regData.password);
    await tokenStore.set(data.access_token);
    set({ token: data.access_token });
    const { data: user } = await usersApi.getMe();
    set({ user, isLoading: false });
  },

  logout: async () => {
    await tokenStore.remove();
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = await tokenStore.get();
      if (!token) {
        set({ isLoading: false });
        return;
      }
      set({ token });
      const { data } = await usersApi.getMe();
      set({ user: data, isLoading: false });
    } catch {
      await tokenStore.remove();
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
