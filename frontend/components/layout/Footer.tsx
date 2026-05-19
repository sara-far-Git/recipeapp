"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, Download } from "lucide-react";

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
    <footer className="border-t border-white/[0.05] mt-16 pb-24 sm:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fire-300 to-ember-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-gray-400">RecipeApp</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-600">
            <Link href="/pro" className="hover:text-fire-400 transition-colors font-semibold text-fire-500/80">
              ✦ גרסת פרו
            </Link>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">מדיניות פרטיות</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">תנאי שימוש</Link>
            <span className="text-gray-700">© 2026 RecipeApp</span>
          </nav>

          {/* Install button */}
          {installPrompt && !installed ? (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 border border-white/[0.06] text-sm text-gray-300 hover:border-fire-500/30 hover:text-fire-300 transition-all"
            >
              <Download className="w-4 h-4" />
              התקנה כאפליקציה
            </button>
          ) : (
            <Link
              href="/install"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 border border-white/[0.06] text-sm text-gray-400 hover:border-fire-500/30 hover:text-fire-300 transition-all"
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
