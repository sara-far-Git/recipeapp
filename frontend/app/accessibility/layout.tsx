import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של הבית של המתכונים.",
  alternates: { canonical: `${SITE_URL}/accessibility` },
  openGraph: { title: "הצהרת נגישות · Recipe Space", description: "הצהרת הנגישות של הבית של המתכונים." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
