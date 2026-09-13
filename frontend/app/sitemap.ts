import { loadSitemapRecipes } from "@/lib/sitemapRecipes";
import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

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

  return [
    ...staticRoutes,
    ...categories,
    ...recipes.map((r) => ({
      url: `${SITE_URL}/recipe/${r.id}`,
      lastModified: r.updated_at || r.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
