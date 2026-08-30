import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "הרשמה",
  description: "פותחים ספר משלכם — שומרים מתכונים וחוזרים אליהם מכל מכשיר.",
  alternates: { canonical: `${SITE_URL}/register` },
  robots: { index: false, follow: true },
  openGraph: { title: "הרשמה · ספר המתכונים", description: "פותחים ספר משלכם — שומרים מתכונים וחוזרים אליהם מכל מכשיר." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
