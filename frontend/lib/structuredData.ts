import { chefName } from "@/lib/attribution";
import { SITE_URL } from "@/lib/site";

type Ingredient = { amount?: number | null; unit?: string | null; name: string };
type Instruction = { step: number; text: string };
export type Recipe = {
  id: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  image_credit?: string | null;
  image_source?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  category?: string | null;
  tags?: string[] | null;
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  chef_name?: string | null;
  author?: { full_name?: string | null; username?: string } | null;
  average_rating?: number | null;
  ratings_count?: number | null;
  created_at?: string;
  updated_at?: string;
};

const iso = (min?: number | null) => (min && min > 0 ? `PT${min}M` : undefined);
export function absoluteImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, SITE_URL);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : undefined;
  } catch { return undefined; }
}

// Prevent recipe text from terminating the script element in server HTML.
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function recipeStructuredData(recipe: Recipe) {
  // Google's Recipe rich result requires a real dish photo. Marking a page as
  // Recipe without one is what Search Console emails as a critical missing
  // `image` field. A logo fallback would also fail that check.
  const image = recipeImageStructuredData(recipe);
  if (!image) return null;

  const recipeIngredient = (recipe.ingredients || [])
    .map((i) => [i.amount ?? "", i.unit ?? "", i.name].filter(Boolean).join(" ").trim())
    .filter(Boolean);
  const recipeInstructions = (recipe.instructions || [])
    .slice()
    .sort((a, b) => a.step - b.step)
    .filter((i) => i.text.trim())
    .map((i) => ({ "@type": "HowToStep" as const, text: i.text }));
  const keywords = [recipe.category, ...(recipe.tags || [])]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${SITE_URL}/recipe/${recipe.id}#recipe`,
    url: `${SITE_URL}/recipe/${recipe.id}`,
    mainEntityOfPage: `${SITE_URL}/recipe/${recipe.id}`,
    inLanguage: "he",
    name: recipe.title,
    description: recipe.description || undefined,
    image,
    author: chefName(recipe)
      ? { "@type": "Person", name: chefName(recipe) }
      : undefined,
    datePublished: recipe.created_at,
    dateModified: recipe.updated_at,
    recipeCategory: recipe.category || undefined,
    keywords: keywords.length ? keywords : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} מנות` : undefined,
    prepTime: iso(recipe.prep_time_minutes),
    cookTime: iso(recipe.cook_time_minutes),
    totalTime: iso((recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)),
    recipeIngredient: recipeIngredient.length ? recipeIngredient : undefined,
    recipeInstructions: recipeInstructions.length ? recipeInstructions : undefined,
    aggregateRating:
      recipe.ratings_count && recipe.average_rating
        ? {
            "@type": "AggregateRating",
            ratingValue: recipe.average_rating,
            ratingCount: recipe.ratings_count,
          }
        : undefined,
  };
}

export type BreadcrumbItem = { name: string; path: string };
export function breadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).href,
    })),
  };
}

export function recipeListStructuredData(recipes: { id: number; is_published?: boolean }[]) {
  const ids = Array.from(new Set(recipes.filter(r => r.is_published === true && Number.isInteger(r.id) && r.id > 0).map(r => r.id)));
  if (ids.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: ids.map((id, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/recipe/${id}`,
    })),
  };
}

// Image authorship cannot be inferred from the recipe author or uploader.
export function recipeImageStructuredData(recipe: Pick<Recipe, "id" | "title" | "image_url" | "image_credit">) {
  const contentUrl = absoluteImage(recipe.image_url);
  if (!contentUrl) return undefined;
  return {
    "@type": "ImageObject",
    creditText: recipe.image_credit || undefined,
    contentUrl,
    url: contentUrl,
    name: recipe.title,
    isPartOf: { "@id": `${SITE_URL}/recipe/${recipe.id}#recipe` },
  };
}
