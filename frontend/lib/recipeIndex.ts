import { apiGet } from "./site";

export type IndexRecipe = {
  id: number;
  title: string;
  category?: string | null;
  is_published?: boolean;
  author?: { username?: string | null; full_name?: string | null } | null;
};

/** Every published recipe, for the crawlable index below the listings.
 *
 *  Never throws. The index is an addition to pages that render without it, so
 *  a cold backend should cost the links and nothing else — unlike the sitemap,
 *  which fails loudly rather than publish a partial catalog.
 */
export async function loadIndexRecipes(max = 600): Promise<IndexRecipe[]> {
  const out: IndexRecipe[] = [];
  for (let skip = 0; skip < max; skip += 100) {
    const page = await apiGet<IndexRecipe[]>(`/recipes?skip=${skip}&limit=100`, 3600);
    if (!Array.isArray(page) || page.length === 0) break;
    out.push(...page);
    if (page.length < 100) break;
  }
  return out.filter(
    (r) => r && Number.isInteger(r.id) && r.id > 0 && typeof r.title === "string" && r.title.trim(),
  );
}
