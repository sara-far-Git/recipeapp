import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "הרשמה",
  description: "פתחו חשבון חינם ושמרו את המתכונים של המשפחה במקום אחד.",
  alternates: { canonical: `${SITE_URL}/register` },
  robots: { index: false, follow: true },
  openGraph: { title: "הרשמה · ספר המתכונים", description: "פתחו חשבון חינם ושמרו את המתכונים של המשפחה במקום אחד." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
