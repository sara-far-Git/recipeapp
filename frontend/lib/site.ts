/** Absolute origins. The browser talks to the API through the rewrite in
 *  vercel.json, but metadata and sitemaps are built on the server, where a
 *  relative path has nothing to resolve against. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://recipeapp-kohl.vercel.app").replace(/\/$/, "");

export const API_ORIGIN = (
  process.env.API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://recipeapp-backend-iwn0.onrender.com"
).replace(/\/$/, "");

/** Server-side GET against the API. Never throws: metadata must not be able to
 *  take a page down, and the backend can be cold. `status` is 0 when the
 *  request never got an answer, which is what separates "no such recipe" from
 *  "the backend is asleep". */
export async function apiGetResult<T>(
  path: string,
  revalidate = 300,
): Promise<{ data: T | null; status: number }> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { data: null, status: res.status };
    return { data: (await res.json()) as T, status: res.status };
  } catch {
    return { data: null, status: 0 };
  }
}

export async function apiGet<T>(path: string, revalidate = 300): Promise<T | null> {
  return (await apiGetResult<T>(path, revalidate)).data;
}
