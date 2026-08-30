import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "איזה מידע נשמר באתר, למה, ולכמה זמן.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: { title: "מדיניות פרטיות · ספר המתכונים", description: "איזה מידע נשמר באתר, למה, ולכמה זמן." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
