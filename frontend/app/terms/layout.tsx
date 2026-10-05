import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "תנאי שימוש",
  description: "התנאים לשימוש בבית של המתכונים.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: { title: "תנאי שימוש · Recipe Space", description: "התנאים לשימוש בבית של המתכונים." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
