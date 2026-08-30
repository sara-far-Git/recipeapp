import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "תנאי שימוש",
  description: "התנאים לשימוש בספר המתכונים.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: { title: "תנאי שימוש · ספר המתכונים", description: "התנאים לשימוש בספר המתכונים." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
