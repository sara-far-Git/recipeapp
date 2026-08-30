import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "חיפוש מתכונים",
  description: "חפשו מתכון לפי שם, קטגוריה, כשרות, רמת קושי או זמן הכנה.",
  alternates: { canonical: `${SITE_URL}/search` },
  openGraph: { title: "חיפוש מתכונים · ספר המתכונים", description: "חפשו מתכון לפי שם, קטגוריה, כשרות, רמת קושי או זמן הכנה." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
