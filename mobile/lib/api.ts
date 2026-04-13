import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const tokenGet = async () => {
  if (Platform.OS === "web") return localStorage.getItem("token");
  return SecureStore.getItemAsync("token");
};
const tokenRemove = async () => {
  if (Platform.OS === "web") { localStorage.removeItem("token"); return; }
  return SecureStore.deleteItemAsync("token");
};

const getBaseUrl = () => {
  // Android emulator uses 10.0.2.2 to reach host machine
  // iOS simulator uses localhost
  // Physical device: replace with your machine's local IP
  if (__DEV__) {
    if (Platform.OS === "android") return "http://10.0.2.2:8000";
    return "http://localhost:8000";
  }
  return "https://recipeapp-backend.onrender.com"; // production URL — update with your actual Render URL
};

const api = axios.create({
  baseURL: `${getBaseUrl()}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await tokenGet();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenRemove();
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------- Auth ----------
export const authApi = {
  register: (data: { username: string; email: string; password: string; full_name?: string }) =>
    api.post("/auth/register", data),
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
};

// ---------- Users ----------
export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateMe: (data: { full_name?: string; bio?: string; avatar_url?: string }) =>
    api.put("/users/me", data),
  getProfile: (username: string) => api.get(`/users/${username}`),
  getRecipes: (username: string, skip = 0) => api.get(`/users/${username}/recipes?skip=${skip}`),
  getSaved: (username: string, skip = 0) => api.get(`/users/${username}/saved?skip=${skip}`),
  toggleFollow: (username: string) => api.post(`/users/${username}/follow`),
  getFollowers: (username: string) => api.get(`/users/${username}/followers`),
  getFollowing: (username: string) => api.get(`/users/${username}/following`),
};

// ---------- Recipes ----------
export const recipesApi = {
  list: (skip = 0, limit = 20) => api.get(`/recipes?skip=${skip}&limit=${limit}`),
  get: (id: number) => api.get(`/recipes/${id}`),
  create: (data: any) => api.post("/recipes", data),
  update: (id: number, data: any) => api.put(`/recipes/${id}`, data),
  delete: (id: number) => api.delete(`/recipes/${id}`),
  toggleLike: (id: number) => api.post(`/recipes/${id}/like`),
  toggleSave: (id: number) => api.post(`/recipes/${id}/save`),
  getComments: (id: number) => api.get(`/recipes/${id}/comments`),
  addComment: (id: number, content: string) => api.post(`/recipes/${id}/comments`, { content }),
  reportComment: (recipeId: number, commentId: number) =>
    api.post(`/recipes/${recipeId}/comments/${commentId}/report`),
};

// ---------- Search ----------
export const searchApi = {
  search: (params: {
    q?: string;
    difficulty?: string;
    kosher_type?: string;
    max_prep_time?: number;
    skip?: number;
  }) => api.get("/search", { params }),
};

// ---------- Scan ----------
export const scanApi = {
  scan: (uri: string, type: string) => {
    const form = new FormData();
    form.append("file", {
      uri,
      type: type || "image/jpeg",
      name: "scan.jpg",
    } as any);
    return api.post("/scan", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
  },
};

// ---------- Upload ----------
export const uploadApi = {
  upload: (uri: string, type: string) => {
    const form = new FormData();
    form.append("file", {
      uri,
      type: type || "image/jpeg",
      name: "photo.jpg",
    } as any);
    return api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ---------- Ratings ----------
export const ratingsApi = {
  rate: (recipeId: number, score: number) =>
    api.post(`/recipes/${recipeId}/rate`, { score }),
};

// ---------- Collections ----------
export const collectionsApi = {
  list: () => api.get("/collections"),
  create: (data: { name: string; description?: string; is_public?: boolean }) =>
    api.post("/collections", data),
  get: (id: number) => api.get(`/collections/${id}`),
  delete: (id: number) => api.delete(`/collections/${id}`),
  toggleRecipe: (collectionId: number, recipeId: number) =>
    api.post(`/collections/${collectionId}/recipes/${recipeId}`),
};

// ---------- Shopping ----------
export const shoppingApi = {
  list: () => api.get("/shopping"),
  create: (name = "רשימת קניות") => api.post("/shopping", { name }),
  get: (id: number) => api.get(`/shopping/${id}`),
  addRecipe: (listId: number, recipeId: number, multiplier = 1) =>
    api.post(`/shopping/${listId}/add-recipe`, { recipe_id: recipeId, servings_multiplier: multiplier }),
  updateItems: (listId: number, items: any[]) => api.put(`/shopping/${listId}/items`, items),
  delete: (id: number) => api.delete(`/shopping/${id}`),
};

// ---------- Suggest ----------
export const suggestApi = {
  fromIngredients: (ingredients: string[]) =>
    api.post("/suggest/from-ingredients", { ingredients }),
  aiGenerate: (ingredients: string[]) =>
    api.post("/suggest/ai-generate", { ingredients }),
};
