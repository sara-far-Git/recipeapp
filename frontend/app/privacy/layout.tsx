import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  // Legal pages are for people who are already here, not for a search for
  // the site: left indexable, the terms page was what Google returned for
  // the brand itself, ahead of the home page.
  robots: { index: false, follow: true },
  title: "מדיניות פרטיות",
  description: "איזה מידע נשמר באתר, למה, ולכמה זמן.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: { title: "מדיניות פרטיות · Recipe Space", description: "איזה מידע נשמר באתר, למה, ולכמה זמן." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
