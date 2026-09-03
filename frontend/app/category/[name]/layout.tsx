import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

type Props = { params: { name: string } };

/** Raw names. Next encodes them itself when it builds the routes — handing it
 *  pre-encoded ones makes it encode the percent signs again, and the page it
 *  generates then sits at a path no link on the site points to. */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ name: c.name }));
}

/** A param reaches here decoded on some paths and encoded on others, so read
 *  it both ways before deciding it is not a category. */
function resolve(param: string) {
  const direct = getCategory(param);
  if (direct) return direct;
  try {
    return getCategory(decodeURIComponent(param));
  } catch {
    return undefined;
  }
}

export function generateMetadata({ params }: Props): Metadata {
  const meta = resolve(params.name);
  if (!meta) return { title: "קטגוריה לא נמצאה", robots: { index: false } };
  return {
    title: meta.name,
    description: meta.desc,
    alternates: { canonical: `${SITE_URL}/category/${encodeURIComponent(meta.name)}` },
    openGraph: { title: `${meta.name} · ספר המתכונים`, description: meta.desc },
  };
}

/** The category list is fixed, so anything else is a real 404 rather than an
 *  empty page echoing whatever was in the URL. */
export default function CategoryLayout({ children, params }: Props & { children: React.ReactNode }) {
  if (!resolve(params.name)) notFound();
  return <>{children}</>;
}
