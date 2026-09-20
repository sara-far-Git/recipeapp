import { notFound } from "next/navigation";
import CategoryView from "@/components/recipe/CategoryView";
import { loadCatalogue } from "@/lib/catalogue";
import { getCategory } from "@/lib/categories";
import { recipeMatchesCategory } from "@/lib/recipeSearch";

// Read at request time and cached briefly by the loader, so a recipe added
// now shows up here without a deploy.
export const dynamic = "force-dynamic";

/** A param reaches here decoded on some paths and encoded on others. */
function resolve(param: string) {
  const direct = getCategory(param);
  if (direct) return direct;
  try {
    return getCategory(decodeURIComponent(param));
  } catch {
    return undefined;
  }
}

export default async function CategoryPage({ params }: { params: { name: string } }) {
  const category = resolve(params.name);
  if (!category) notFound();

  const recipes = (await loadCatalogue())
    .filter((r) => recipeMatchesCategory(r, category.name));

  return <CategoryView name={category.name} desc={category.desc} recipes={recipes} />;
}
