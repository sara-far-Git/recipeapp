import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "התקנה כאפליקציה",
  description: "איך מוסיפים את ספר המתכונים למסך הבית, באייפון ובאנדרואיד.",
  alternates: { canonical: `${SITE_URL}/install` },
  openGraph: { title: "התקנה כאפליקציה · ספר המתכונים", description: "איך מוסיפים את ספר המתכונים למסך הבית, באייפון ובאנדרואיד." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
