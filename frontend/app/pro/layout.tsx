import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "גרסת פרו",
  description: "התכונות המתקדמות של ספר המתכונים, ורשימת ההמתנה אליהן.",
  alternates: { canonical: `${SITE_URL}/pro` },
  openGraph: { title: "גרסת פרו · ספר המתכונים", description: "התכונות המתקדמות של ספר המתכונים, ורשימת ההמתנה אליהן." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
