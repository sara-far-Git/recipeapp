import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RecipeIndex from "@/components/seo/RecipeIndex";
import { loadIndexRecipes } from "@/lib/recipeIndex";
import { SITE_URL, apiGetResult } from "@/lib/site";
import { serializeJsonLd } from "@/lib/structuredData";
import type { Metadata } from "next";

type Props = { params: { username: string } };

type PublicUser = {
  username: string;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  recipes_count?: number;
};

/** A profile answers 404 unless its owner is on a paid plan and turned the
 *  public toggle on. Indexing follows that same answer rather than a second
 *  rule kept in step by hand, so a profile turned private stops being
 *  indexable on its own. */
const getProfile = (username: string) =>
  apiGetResult<PublicUser>(`/users/${encodeURIComponent(decodeURIComponent(username))}`);

function displayName(user: PublicUser, fallback: string) {
  return (user.full_name || "").trim() || fallback.replace(/_/g, " ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raw = decodeURIComponent(params.username);
  const { data: user, status } = await getProfile(params.username);
  // Only a definite 404 means the profile is private or missing. A backend
  // that was still waking up must not hand a crawler a page asking not to be
  // indexed — the same rule the recipe pages follow.
  if (!user) {
    return status === 404
      ? { title: "פרופיל", robots: { index: false, follow: true } }
      : { title: "פרופיל", alternates: { canonical: `${SITE_URL}/profile/${encodeURIComponent(raw)}` } };
  }

  const name = displayName(user, raw);
  const count = user.recipes_count ?? 0;
  const description =
    (user.bio || "").trim() ||
    (count > 0
      ? `${count} מתכונים של ${name}, בבית של המתכונים.`
      : `המתכונים של ${name}, בבית של המתכונים.`);
  const url = `${SITE_URL}/profile/${encodeURIComponent(raw)}`;

  return {
    title: `${name} · מתכונים`,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { type: "profile", title: `${name} · מתכונים`, description, url },
  };
}

export default async function ProfileLayout({ children, params }: Props & { children: React.ReactNode }) {
  const raw = decodeURIComponent(params.username);
  const { data: user } = await getProfile(params.username);
  // The profile page renders in the browser, so without this a crawler sees
  // neither the cook's name nor a single one of their recipes.
  if (!user) return <>{children}</>;

  const name = displayName(user, raw);
  const recipes = (await loadIndexRecipes()).filter((r) => r.author?.username === user.username);
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${SITE_URL}/profile/${encodeURIComponent(raw)}`,
    ...((user.bio || "").trim() ? { description: user.bio!.trim() } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(person) }} />
      <Breadcrumbs items={[
        { name: "בית", path: "/" },
        { name: "מתכונים", path: "/recipes" },
        { name, path: `/profile/${encodeURIComponent(raw)}` },
      ]} />
      {children}
      <RecipeIndex recipes={recipes} heading={`כל המתכונים של ${name}`} />
    </>
  );
}
