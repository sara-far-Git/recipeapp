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
 *  It sits outside the page's cream panel, on the dark ground the body paints
 *  behind it, so it colours itself for that and not for the panel.
 *
 *  Folded shut by default. Two hundred links are a wall, not a list, and the
 *  markup is the same open or closed — a crawler reads the whole thing either
 *  way. Readers see it too; a list rendered only for crawlers would be
 *  cloaking.
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
    <nav
      aria-label={heading}
      dir="rtl"
      className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-sm sm:px-6"
      style={{ color: "#E3CFB2" }}
    >
      {data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      )}
      <details>
        <summary
          className="cursor-pointer list-none py-2 font-semibold underline-offset-4 hover:underline"
          style={{ color: "#E3CFB2" }}
        >
          {heading}
          <span className="mr-2 font-normal" style={{ color: "#D97757" }}>
            {published.length}
          </span>
        </summary>
        {/* Columns, not a wrapped row. Two hundred titles set in a single
            flowing line read as one long paragraph — you cannot find anything
            in it, and it does not look like a list of links at all. */}
        <ul className="columns-2 gap-x-8 pt-3 opacity-90 sm:columns-3 lg:columns-4">
          {published.map((r) => (
            <li key={r.id} className="break-inside-avoid py-1 leading-snug">
              <Link
                href={`/recipe/${r.id}`}
                className="underline-offset-4 hover:underline"
                style={{ color: "inherit" }}
              >
                {r.title}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
