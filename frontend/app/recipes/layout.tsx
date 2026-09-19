import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RecipeIndex from "@/components/seo/RecipeIndex";
import { loadIndexRecipes } from "@/lib/recipeIndex";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "כל המתכונים",
  alternates: { canonical: `${SITE_URL}/recipes` },
  description: "המתכונים של הקהילה, עם סינון לפי שף, קטגוריה, זמן הכנה, כשרות ורמת קושי.",
};

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  const recipes = await loadIndexRecipes();
  return (
    <>
      <Breadcrumbs items={[{ name: "בית", path: "/" }, { name: "מתכונים", path: "/recipes" }]} />
      {children}
      <RecipeIndex recipes={recipes} heading="כל המתכונים באתר" />
    </>
  );
}
