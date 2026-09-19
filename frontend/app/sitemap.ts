import { loadSitemapRecipes } from "@/lib/sitemapRecipes";
import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { SITE_URL, apiGetResult } from "@/lib/site";

// Fetch the catalog at request time: API availability must not block deployment.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/recipes", "/search", "/pro", "/install", "/privacy", "/terms", "/accessibility"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  // Fail regeneration on API errors instead of publishing a partial sitemap.
  // Empty categories stay out of the sitemap until they contain recipes.
  const recipes = await loadSitemapRecipes();

  const filled = new Set(
    recipes.map((r) => r.category).filter((c): c is string => Boolean(c)),
  );
  const categories = CATEGORIES.filter((c) => filled.has(c.name)).map((c) => ({
    url: `${SITE_URL}/category/${encodeURIComponent(c.name)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // A cook's own page is where a search for their name should land. Only the
  // ones who turned the public toggle on have a page at all — the API answers
  // 404 for the rest — so ask it rather than guess, and keep soft 404s out of
  // the sitemap.
  const authors = Array.from(
    new Set(
      recipes
        .map((r) => r.author?.username)
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0),
    ),
  );
  const checked = await Promise.all(
    authors.map(async (username) => {
      const { status } = await apiGetResult(`/users/${encodeURIComponent(username)}`, 3600);
      return status === 200 ? username : null;
    }),
  );
  const profiles = checked
    .filter((u): u is string => u !== null)
    .map((username) => ({
      url: `${SITE_URL}/profile/${encodeURIComponent(username)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...categories,
    ...profiles,
    ...recipes.map((r) => ({
      url: `${SITE_URL}/recipe/${r.id}`,
      lastModified: r.updated_at || r.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
