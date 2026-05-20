import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/ui/InstallBanner";

export const metadata: Metadata = {
  title: "Recipes Book — ספר המתכונים שלכם",
  description: "שתפו, גלו ובשלו מתכונים עם הקהילה",
  manifest: "/manifest.json",
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
  <html lang="he" dir="rtl">
  <head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link
  href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&display=swap"
  rel="stylesheet"
  />
  </head>
  <body className="min-h-screen">
  <AuthProvider>
  <Header />
  <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
  {children}
  </main>
  <Footer />
  <BottomNav />
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
