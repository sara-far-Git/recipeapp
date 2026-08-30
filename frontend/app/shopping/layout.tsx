import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "רשימת קניות",
  description: "כל המצרכים מהמתכונים שבחרתם, מרוכזים ברשימה אחת.",
  alternates: { canonical: `${SITE_URL}/shopping` },
  robots: { index: false, follow: true },
  openGraph: { title: "רשימת קניות · ספר המתכונים", description: "כל המצרכים מהמתכונים שבחרתם, מרוכזים ברשימה אחת." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
