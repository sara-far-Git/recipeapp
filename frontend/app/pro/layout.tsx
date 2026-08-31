import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "גרסת Pro",
  description: "יותר סריקות AI, ייבוא מקישור, פרסום לקהילה וחבילת סריקות נוספת.",
  alternates: { canonical: `${SITE_URL}/pro` },
  openGraph: {
    title: "גרסת Pro · ספר המתכונים",
    description: "יותר סריקות AI, ייבוא מקישור, פרסום לקהילה וחבילת סריקות נוספת.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
