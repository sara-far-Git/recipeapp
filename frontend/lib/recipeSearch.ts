import { CATEGORIES } from "./categories";

/** Title/description hints for recipes saved before category existed. */
const CATEGORY_HINTS: Record<string, string[]> = {
  ראשונות: ["מרק", "מנה ראשונה", "ממרח", "פטה", "קרוסט"],
  עיקריות: ["סלמון", "עוף", "בשר", "דג", "פסטה", "אורז", "תבשיל", "קציצות", "שניצל", "לזניה"],
  מאפים: ["עוגה", "עוגיות", "לחם", "חלה", "בורקס", "מאפה", "בצק", "פאי", "קיש", "שטרודל", "קרואסון", "מאפינס"],
  קינוחים: ["עוגה", "מוס", "טרמיסו", "גלידה", "קרם", "קינוח", "שוקולד", "רולדה"],
  סלטים: ["סלט"],
  משקאות: ["שייק", "לימונדה", "קוקטייל", "מיץ", "תה", "קפה", "שוקו"],
};

const HEBREW_END = /[א-ת]$/;

function haystack(recipe: { title?: string; description?: string | null }) {
  return `${recipe.title || ""} ${recipe.description || ""}`;
}

function wordVariants(word: string): string[] {
  if (word.length >= 4 && HEBREW_END.test(word)) return [word, word.slice(0, -1)];
  return [word];
}

export function recipeMatchesCategory(
  recipe: { title?: string; description?: string | null; category?: string | null },
  category: string,
): boolean {
  if (recipe.category) return recipe.category === category;
  if (!(CATEGORIES as readonly { name: string }[]).some((c) => c.name === category)) return false;
  const text = haystack(recipe);
  return (CATEGORY_HINTS[category] || []).some((hint) => text.includes(hint));
}

export function recipeMatchesSearch(
  recipe: {
    title?: string;
    description?: string | null;
    category?: string | null;
    difficulty?: string;
    kosher_type?: string | null;
    prep_time_minutes?: number | null;
  },
  params: {
    q?: string;
    category?: string;
    difficulty?: string;
    kosher_type?: string;
    max_prep_time?: number;
  },
): boolean {
  if (params.q) {
    const text = haystack(recipe);
    for (const word of params.q.split(/\s+/).filter(Boolean)) {
      if (!wordVariants(word).some((v) => text.includes(v))) return false;
    }
  }
  if (params.category && !recipeMatchesCategory(recipe, params.category)) return false;
  if (params.difficulty && recipe.difficulty !== params.difficulty) return false;
  if (params.kosher_type && recipe.kosher_type !== params.kosher_type) return false;
  if (params.max_prep_time && (recipe.prep_time_minutes ?? Number.POSITIVE_INFINITY) > params.max_prep_time) {
    return false;
  }
  return true;
}

export function mergeRecipesById<T extends { id: number }>(...lists: T[][]): T[] {
  const map = new Map<number, T>();
  for (const list of lists) {
    for (const recipe of list) map.set(recipe.id, recipe);
  }
  return Array.from(map.values()).sort((a, b) => {
    const aTime = new Date((a as { created_at?: string }).created_at || 0).getTime();
    const bTime = new Date((b as { created_at?: string }).created_at || 0).getTime();
    return bTime - aTime;
  });
}
