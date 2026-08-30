import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "התחברות",
  description: "התחברו כדי לשמור מתכונים, לנהל רשימת קניות ולשתף מהמטבח שלכם.",
  alternates: { canonical: `${SITE_URL}/login` },
  robots: { index: false, follow: true },
  openGraph: { title: "התחברות · ספר המתכונים", description: "התחברו כדי לשמור מתכונים, לנהל רשימת קניות ולשתף מהמטבח שלכם." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
