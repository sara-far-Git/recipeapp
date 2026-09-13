import { API_ORIGIN } from "./site";

export type SitemapRecipe = { id: number; category?: string | null; updated_at?: string; created_at?: string };

export async function loadSitemapRecipes(): Promise<SitemapRecipe[]> {
  const recipes = new Map<number, SitemapRecipe>();
  for (let skip = 0; ; skip += 100) {
    let page: SitemapRecipe[] | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`${API_ORIGIN}/api/v1/recipes?skip=${skip}&limit=100`, {
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error(`Recipe API status ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.some(r => !r || !Number.isInteger(r.id) || r.id <= 0)) {
          throw new Error("Invalid recipe list");
        }
        page = data;
        break;
      } catch {
        if (attempt === 2) throw new Error(`Could not generate complete sitemap at offset ${skip}`);
      }
    }
    if (!page) throw new Error("Missing recipe page");
    const previousSize = recipes.size;
    for (const recipe of page) recipes.set(recipe.id, recipe);
    if (page.length < 100) return Array.from(recipes.values());
    if (recipes.size === previousSize) throw new Error("Recipe pagination did not advance");
  }
}
