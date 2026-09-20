import { apiGet } from "./site";

export type CatalogueRecipe = {
  id: number;
  title: string;
  category?: string | null;
  tags?: string[] | null;
  difficulty?: string;
  kosher_type?: string;
  prep_time_minutes?: number;
  image_url?: string | null;
  chef_name?: string | null;
  is_published?: boolean;
  author: { username: string; full_name?: string };
};

/** Every published recipe, read on the server.
 *
 *  This is what puts the recipes into the HTML. The listing used to fetch
 *  itself in the browser, so the page a crawler received held the filters and
 *  nothing to filter — no title, no link, no recipe.
 *
 *  Never throws. An empty list is a page the browser can still fill in, and
 *  the listing falls back to fetching for itself when it gets one; a thrown
 *  error would be no page at all.
 */
export async function loadCatalogue(max = 1000): Promise<CatalogueRecipe[]> {
  const byId = new Map<number, CatalogueRecipe>();
  for (let skip = 0; skip < max; skip += 100) {
    const page = await apiGet<CatalogueRecipe[]>(`/recipes?skip=${skip}&limit=100`, 300);
    if (!Array.isArray(page) || page.length === 0) break;
    for (const recipe of page) {
      if (recipe && Number.isInteger(recipe.id)) byId.set(recipe.id, recipe);
    }
    if (page.length < 100) break;
  }
  return Array.from(byId.values());
}
