import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

type Props = { params: { name: string } };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ name: encodeURIComponent(c.name) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const name = decodeURIComponent(params.name);
  const meta = getCategory(name);
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
  if (!getCategory(decodeURIComponent(params.name))) notFound();
  return <>{children}</>;
}
