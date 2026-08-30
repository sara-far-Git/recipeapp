import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Assistant, Heebo } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SITE_URL } from "@/lib/site";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/ui/InstallBanner";

// Self-hosted by Next at build time: no render-blocking request to Google and
// no reflow when the Hebrew faces land.
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-assistant",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set their own title; this frames it and covers the routes that don't.
  title: {
    default: "ספר המתכונים — מתכונים שעוברים במשפחה",
    template: "%s · ספר המתכונים",
  },
  description: "שתפו, גלו ובשלו מתכונים עם הקהילה, עם רשימת קניות שנבנית לבד.",
  applicationName: "ספר המתכונים",
  manifest: "/manifest.json",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: "ספר המתכונים",
    locale: "he_IL",
    url: SITE_URL,
    title: "ספר המתכונים — מתכונים שעוברים במשפחה",
    description: "שתפו, גלו ובשלו מתכונים עם הקהילה, עם רשימת קניות שנבנית לבד.",
    images: [{ url: "/icon-512", width: 512, height: 512, alt: "ספר המתכונים" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ספר המתכונים",
    description: "שתפו, גלו ובשלו מתכונים עם הקהילה.",
    images: ["/icon-512"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "מתכונים",
  },
};

export const viewport: Viewport = {
  themeColor: "#efe7d7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} ${heebo.variable}`}>
      <body className="min-h-screen">
        <AuthProvider>
          <Suspense fallback={null}><Header /></Suspense>
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
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
