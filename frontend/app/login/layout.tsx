import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "התחברות",
  description: "כניסה לספר — המתכונים ורשימת הקניות מחכים בפנים.",
  alternates: { canonical: `${SITE_URL}/login` },
  robots: { index: false, follow: true },
  openGraph: { title: "התחברות · ספר המתכונים", description: "כניסה לספר — המתכונים ורשימת הקניות מחכים בפנים." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
