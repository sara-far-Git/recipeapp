import axios, { type AxiosRequestConfig } from "axios";

// ── Lightweight GET cache ─────────────────────────────────────────────────────
// Deduplicates concurrent identical requests and short-circuits repeated calls
// within the TTL window. Mutations call invalidateCache() to bust stale entries.

type CacheEntry = { data: any; expires: number };
const _getCache = new Map<string, CacheEntry>();
const _inflight = new Map<string, Promise<any>>();

function _key(url: string, params?: Record<string, any>): string {
  if (!params) return url;
  const qs = Object.keys(params).sort()
    .filter((k) => params[k] != null && params[k] !== "")
    .map((k) => `${k}=${params[k]}`).join("&");
  return qs ? `${url}?${qs}` : url;
}

function cachedGet(url: string, params?: Record<string, any>, ttlMs = 30_000): Promise<any> {
  const key = _key(url, params);
  const hit = _getCache.get(key);
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.data);
  const inflight = _inflight.get(key);
  if (inflight) return inflight;
  const promise = api.get(url, { params })
    .then((res) => { _getCache.set(key, { data: res, expires: Date.now() + ttlMs }); _inflight.delete(key); return res; })
    .catch((err) => { _inflight.delete(key); throw err; });
  _inflight.set(key, promise);
  return promise;
}

export function invalidateCache(prefix: string) {
  Array.from(_getCache.keys()).forEach((k) => { if (k.startsWith(prefix)) _getCache.delete(k); });
}

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !error.config?.skipAuthRedirect
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------- Auth ----------
export const authApi = {
  register: (data: { username: string; email: string; password: string; full_name?: string }) =>
    api.post("/auth/register", data, { skipAuthRedirect: true }),
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      skipAuthRedirect: true,
    });
  },
  googleLogin: (idToken: string) =>
    api.post("/auth/google", { id_token: idToken }, { skipAuthRedirect: true }),
};

// ---------- Users ----------
export const usersApi = {
  getMe: (config?: AxiosRequestConfig) => api.get("/users/me", config),
  updateMe: (data: { full_name?: string; bio?: string; avatar_url?: string }) =>
    api.put("/users/me", data).then((r) => { invalidateCache("/users/me"); return r; }),
  getProfile: (username: string) => cachedGet(`/users/${username}`, undefined, 60_000),
  getRecipes: (username: string, skip = 0) => cachedGet(`/users/${username}/recipes`, { skip }, 30_000),
  getSaved: (username: string, skip = 0) => cachedGet(`/users/${username}/saved`, { skip }, 30_000),
  toggleFollow: (username: string) =>
    api.post(`/users/${username}/follow`).then((r) => { invalidateCache(`/users/${username}`); return r; }),
  getFollowers: (username: string) => cachedGet(`/users/${username}/followers`, undefined, 60_000),
  getFollowing: (username: string) => cachedGet(`/users/${username}/following`, undefined, 60_000),
};

// ---------- Recipes ----------
export const recipesApi = {
  list: (skip = 0, limit = 20) => cachedGet("/recipes", { skip, limit }, 20_000),
  get: (id: number) => cachedGet(`/recipes/${id}`, undefined, 60_000),
  create: (data: any) =>
    api.post("/recipes", data).then((r) => { invalidateCache("/recipes"); return r; }),
  update: (id: number, data: any) =>
    api.put(`/recipes/${id}`, data).then((r) => { invalidateCache("/recipes"); invalidateCache(`/recipes/${id}`); return r; }),
  delete: (id: number) =>
    api.delete(`/recipes/${id}`).then((r) => { invalidateCache("/recipes"); invalidateCache(`/recipes/${id}`); return r; }),
  toggleLike: (id: number) =>
    api.post(`/recipes/${id}/like`).then((r) => { invalidateCache(`/recipes/${id}`); return r; }),
  toggleSave: (id: number) =>
    api.post(`/recipes/${id}/save`).then((r) => { invalidateCache(`/recipes/${id}`); return r; }),
  rate: (id: number, score: number) =>
    api.post(`/recipes/${id}/rate`, { score }).then((r) => { invalidateCache(`/recipes/${id}`); return r; }),
  getComments: (id: number) => cachedGet(`/recipes/${id}/comments`, undefined, 30_000),
  addComment: (id: number, content: string) =>
    api.post(`/recipes/${id}/comments`, { content }).then((r) => { invalidateCache(`/recipes/${id}/comments`); return r; }),
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
    category?: string;
    skip?: number;
    limit?: number;
  }) => cachedGet("/search", params as Record<string, any>, 20_000),
};

// ---------- Scan ----------
export const scanApi = {
  scan: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/scan", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ---------- Import (URL) ----------
export const importApi = {
  fromUrl: (url: string) => api.post("/import", { url }),
};

// ---------- Upload ----------
export const uploadApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ---------- Collections ----------
export const collectionsApi = {
  list: () => api.get("/collections"),
  create: (data: { name: string; description?: string; is_public?: boolean }) =>
    api.post("/collections", data),
  get: (id: number) => api.get(`/collections/${id}`),
  update: (id: number, data: any) => api.put(`/collections/${id}`, data),
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
