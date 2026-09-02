import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SITE_URL } from "@/lib/site";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/ui/InstallBanner";

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
  themeColor: "#FAF8F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (location.hostname === '127.0.0.1') {
                var localPort = location.port ? ':' + location.port : '';
                location.replace('http://localhost' + localPort + location.pathname + location.search + location.hash);
              }
              window.__pwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaPrompt = e;
                window.dispatchEvent(new Event('pwa-prompt-ready'));
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                  if (isLocal) {
                    Promise.all([
                      navigator.serviceWorker.getRegistrations().then(function(regs) {
                        regs.forEach(function(reg) { reg.unregister(); });
                      }),
                      window.caches
                        ? caches.keys().then(function(keys) {
                            return Promise.all(keys.map(function(key) { return caches.delete(key); }));
                          })
                        : Promise.resolve()
                    ]).then(function() {
                      if (navigator.serviceWorker.controller && !sessionStorage.getItem('sw-dev-cleaned-v2')) {
                        sessionStorage.setItem('sw-dev-cleaned-v2', '1');
                        location.reload();
                      }
                    }).catch(function() {});
                    return;
                  }
                  if (location.protocol === 'https:') {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  }
                });
              }
            `,
          }}
        />
        <AuthProvider>
          <Suspense fallback={null}><Header /></Suspense>
          <main className="page-shell pb-24 sm:pb-8">
            {children}
          </main>
          <Footer />
          <Suspense fallback={null}><BottomNav /></Suspense>
          <InstallBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
