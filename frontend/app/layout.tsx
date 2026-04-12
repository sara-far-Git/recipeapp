import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecipeApp — רשת חברתית למתכונים",
  description: "שתף, גלה ובשל מתכונים עם הקהילה",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
