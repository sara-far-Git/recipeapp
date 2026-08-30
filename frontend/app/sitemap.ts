import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { SITE_URL, apiGet } from "@/lib/site";

export const revalidate = 3600;

type RecipeStub = { id: number; updated_at?: string; created_at?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/search", "/pro", "/install", "/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const categories = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/category/${encodeURIComponent(c.name)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 100 is the API's hard ceiling per page, so walk it. The backend can be cold
  // or down; a sitemap without the recipes still beats a failed build.
  const recipes: RecipeStub[] = [];
  for (let skip = 0; skip < 1000; skip += 100) {
    const page = await apiGet<RecipeStub[]>(`/recipes?skip=${skip}&limit=100`, 3600);
    if (!page?.length) break;
    recipes.push(...page);
    if (page.length < 100) break;
  }

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
