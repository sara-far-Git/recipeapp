import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "RecipeApp — רשת חברתית למתכונים",
  description: "שתפו, גלו ובשלו מתכונים עם הקהילה",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#b8401a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="מתכונים" />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
