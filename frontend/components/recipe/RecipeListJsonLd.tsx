import { recipeListStructuredData, serializeJsonLd } from "@/lib/structuredData";

export default function RecipeListJsonLd({ recipes }: { recipes: { id: number; is_published?: boolean }[] }) {
  const data = recipeListStructuredData(recipes);
  return data ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} /> : null;
}
