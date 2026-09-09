import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { SITE_URL, apiGet } from "@/lib/site";

export const revalidate = 3600;

type RecipeStub = {
  id: number;
  category?: string | null;
  updated_at?: string;
  created_at?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/recipes", "/search", "/pro", "/install", "/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
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

  /* Only the categories that actually hold something. A category with no
     recipes in it is an empty page, and handing Google a list of empty pages
     is how a small site ends up reported as "crawled, currently not indexed":
     it spends the crawl on nothing and reads the site as thin. They come back
     on their own as soon as a recipe is filed under them. */
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
