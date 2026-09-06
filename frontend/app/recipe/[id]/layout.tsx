import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, apiGetResult } from "@/lib/site";

type Props = { params: { id: string } };

type Ingredient = { amount?: number | null; unit?: string | null; name: string };
type Instruction = { step: number; text: string };
type Recipe = {
  id: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  category?: string | null;
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  author?: { full_name?: string | null; username?: string } | null;
  average_rating?: number | null;
  ratings_count?: number | null;
  created_at?: string;
};

const getRecipe = (id: string) => apiGetResult<Recipe>(`/recipes/${encodeURIComponent(id)}`);

const iso = (min?: number | null) => (min && min > 0 ? `PT${min}M` : undefined);

/** Photos kept in our own database are addressed by a path, which is all the
 *  browser needs. Open Graph and schema.org are read off the page by machines
 *  that have no origin to resolve it against, so they get the full URL. */
const absolute = (url?: string | null) =>
  !url ? undefined : url.startsWith("/") ? `${SITE_URL}${url}` : url;

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
  const image = absolute(recipe.image_url) || `${SITE_URL}/icon-512`;

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
  const data = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description || undefined,
    image: absolute(recipe.image_url) || undefined,
    author: recipe.author?.full_name
      ? { "@type": "Person", name: recipe.author.full_name }
      : undefined,
    datePublished: recipe.created_at,
    recipeCategory: recipe.category || undefined,
    recipeYield: recipe.servings ? `${recipe.servings} מנות` : undefined,
    prepTime: iso(recipe.prep_time_minutes),
    cookTime: iso(recipe.cook_time_minutes),
    totalTime: iso((recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)),
    recipeIngredient: (recipe.ingredients || []).map((i) =>
      [i.amount ?? "", i.unit ?? "", i.name].filter(Boolean).join(" ").trim(),
    ),
    recipeInstructions: (recipe.instructions || [])
      .slice()
      .sort((a, b) => a.step - b.step)
      .map((i) => ({ "@type": "HowToStep", text: i.text })),
    aggregateRating:
      recipe.ratings_count && recipe.average_rating
        ? {
            "@type": "AggregateRating",
            ratingValue: recipe.average_rating,
            ratingCount: recipe.ratings_count,
          }
        : undefined,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
      {recipe && <RecipeJsonLd recipe={recipe} />}
      {children}
    </>
  );
}
