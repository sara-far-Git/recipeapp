import Link from "next/link";
import { recipeListStructuredData, serializeJsonLd } from "@/lib/structuredData";
import type { IndexRecipe } from "@/lib/recipeIndex";

/** A plain list of recipe links, rendered on the server.
 *
 *  Every listing on this site is a client component: it fetches after the page
 *  loads, so the HTML a crawler receives carries no link to any recipe at all.
 *  The sitemap was the only way in, which is why the recipes sat at "crawled,
 *  currently not indexed" — discovered, but with nothing pointing at them.
 *
 *  Readers see this list too. One rendered only for crawlers would be cloaking,
 *  and an index of a page's own contents is worth showing anyway.
 */
export default function RecipeIndex({
  recipes,
  heading,
}: {
  recipes: IndexRecipe[];
  heading: string;
}) {
  const published = recipes.filter((r) => r.is_published !== false);
  if (published.length === 0) return null;
  const data = recipeListStructuredData(published);

  return (
    <nav aria-label={heading} dir="rtl" className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6">
      {data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      )}
      <h2 className="mb-4 border-t pt-6 text-base font-semibold" style={{ color: "#0B2A20", borderColor: "#E3CFB2" }}>
        {heading}
      </h2>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {published.map((r) => (
          <li key={r.id}>
            <Link
              href={`/recipe/${r.id}`}
              className="underline-offset-4 hover:underline"
              style={{ color: "#0B2A20" }}
            >
              {r.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
