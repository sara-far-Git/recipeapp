import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Heebo } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SITE_URL } from "@/lib/site";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/ui/InstallBanner";

// One heavy geometric sans — the closest Hebrew match to the logo’s
// blocky, tightly packed RECIPE SPACE lettering.
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set their own title; this frames it and covers the routes that don't.
  title: {
    default: "ספר המתכונים — המתכונים שנשארים",
    template: "%s · ספר המתכונים",
  },
  description: "שומרים מתכונים של הבית, מוצאים אותם כשצריך, ובונים רשימת קניות מהם.",
  applicationName: "ספר המתכונים",
  manifest: "/manifest.json",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: "ספר המתכונים",
    locale: "he_IL",
    url: SITE_URL,
    title: "ספר המתכונים — המתכונים שנשארים",
    description: "שומרים מתכונים של הבית, מוצאים אותם כשצריך, ובונים רשימת קניות מהם.",
    images: [{ url: "/icon-512", width: 512, height: 512, alt: "ספר המתכונים" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ספר המתכונים",
    description: "שומרים מתכונים של הבית, ובונים רשימת קניות מהם.",
    images: ["/icon-512"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "מתכונים",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1814",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen">
        <AuthProvider>
          <Suspense fallback={null}><Header /></Suspense>
          <main className="page-shell pb-24 sm:pb-8">
            {children}
          </main>
          <Footer />
          <Suspense fallback={null}><BottomNav /></Suspense>
          <InstallBanner />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaPrompt = e;
                window.dispatchEvent(new Event('pwa-prompt-ready'));
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
