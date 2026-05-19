import axios from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

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
  rate: (id: number, score: number) => api.post(`/recipes/${id}/rate`, { score }),
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
    limit?: number;
  }) => api.get("/search", { params }),
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
