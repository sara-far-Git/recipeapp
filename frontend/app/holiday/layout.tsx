import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "תכנון ראש השנה",
  description: "ארבע סעודות לראש השנה — שתיים בלילה ושתיים ביום. בוחרים מתכון אחד לכל מנה, ואז מוציאים רשימת קניות.",
  alternates: { canonical: `${SITE_URL}/holiday` },
  openGraph: {
    title: "תכנון ראש השנה · ספר המתכונים",
    description: "ארבע סעודות לראש השנה — שתיים בלילה ושתיים ביום. בוחרים מתכון אחד לכל מנה, ואז מוציאים רשימת קניות.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
