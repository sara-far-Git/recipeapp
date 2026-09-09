import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getCategory } from "@/lib/categories";
import { absoluteImage, recipeStructuredData, serializeJsonLd, type Recipe } from "@/lib/structuredData";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, apiGetResult } from "@/lib/site";

type Props = { params: { id: string } };

const getRecipe = (id: string) => apiGetResult<Recipe>(`/recipes/${encodeURIComponent(id)}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: recipe, status } = await getRecipe(params.id);
  // Same rule as the layout below: only a definite 404 means the recipe is
  // gone. A backend that was still waking up must not hand a crawler a page
  // that calls itself missing and asks not to be indexed.
  if (!recipe) {
    return status === 404
      ? { title: "המתכון לא נמצא", robots: { index: false, follow: true } }
      : { alternates: { canonical: `${SITE_URL}/recipe/${encodeURIComponent(params.id)}` } };
  }

  const description =
    recipe.description?.trim() ||
    `מתכון ל${recipe.title}${recipe.category ? ` · ${recipe.category}` : ""}, בספר המתכונים.`;
  const url = `${SITE_URL}/recipe/${recipe.id}`;
  const image = absoluteImage(recipe.image_url) || `${SITE_URL}/icon-512`;

  return {
    title: recipe.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: recipe.title,
      description,
      url,
      images: [{ url: image, alt: recipe.title }],
    },
    twitter: { card: "summary_large_image", title: recipe.title, description, images: [image] },
  };
}

/** The page itself renders in the browser, so without this the recipe is
 *  invisible to anything that does not run scripts. */
function RecipeJsonLd({ recipe }: { recipe: Recipe }) {
  const data = recipeStructuredData(recipe);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export default async function RecipeLayout({ children, params }: Props & { children: React.ReactNode }) {
  const { data: recipe, status } = await getRecipe(params.id);
  // Only a definite answer from the API is a 404 — a cold or unreachable
  // backend must not turn every recipe into a missing page.
  if (status === 404) notFound();
  return (
    <>
      {recipe && <>
        <RecipeJsonLd recipe={recipe} />
        <Breadcrumbs items={[
          { name: "בית", path: "/" },
          { name: "מתכונים", path: "/recipes" },
          ...(recipe.category && getCategory(recipe.category) ? [{ name: recipe.category, path: `/category/${encodeURIComponent(recipe.category)}` }] : []),
          { name: recipe.title, path: `/recipe/${recipe.id}` },
        ]} />
      </>}
      {children}
    </>
  );
}
