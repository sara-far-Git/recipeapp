import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  // Legal pages are for people who are already here, not for a search for
  // the site: left indexable, the terms page was what Google returned for
  // the brand itself, ahead of the home page.
  robots: { index: false, follow: true },
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של הבית של המתכונים.",
  alternates: { canonical: `${SITE_URL}/accessibility` },
  openGraph: { title: "הצהרת נגישות · Recipe Space", description: "הצהרת הנגישות של הבית של המתכונים." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
