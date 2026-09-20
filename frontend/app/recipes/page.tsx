import RecipesBrowser from "@/components/recipe/RecipesBrowser";
import { loadCatalogue } from "@/lib/catalogue";

// Read at request time and cached briefly by the loader. A recipe added now
// should appear without a deploy.
export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await loadCatalogue();
  return <RecipesBrowser initial={recipes} />;
}
