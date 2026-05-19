"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function Footer() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  };

  return (
    <footer className="border-t border-surface-400 mt-16 pb-24 sm:pb-0" style={{ background: "#fff" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-display font-bold text-bark-500">RecipeApp</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-smoke-400">
            <Link href="/pro" className="hover:text-cinnamon-600 transition-colors font-semibold text-cinnamon-500">
              ✦ גרסת פרו
            </Link>
            <Link href="/privacy" className="hover:text-bark-500 transition-colors">מדיניות פרטיות</Link>
            <Link href="/terms" className="hover:text-bark-500 transition-colors">תנאי שימוש</Link>
            <span className="text-smoke-300">© 2026 RecipeApp</span>
          </nav>

          {/* Install button */}
          {installPrompt && !installed ? (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 border border-surface-400 text-sm text-bark-400 hover:border-cinnamon-400 hover:text-cinnamon-600 transition-all"
            >
              <Download className="w-4 h-4" />
              התקנה כאפליקציה
            </button>
          ) : (
            <Link
              href="/install"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 border border-surface-400 text-sm text-bark-400 hover:border-cinnamon-400 hover:text-cinnamon-600 transition-all"
            >
              <Download className="w-4 h-4" />
              הורידי כאפליקציה
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
