"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";

export default function Footer() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  };

  const showButton = !installed && (installPrompt || isIOS);

  return (
    <>
      {/* iOS install guide popup */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowIOSGuide(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl border-t border-surface-300 shadow-warm-lg p-6 pb-10 animate-slide-up">
            <button onClick={() => setShowIOSGuide(false)} className="absolute top-4 left-4 p-1.5 rounded-xl hover:bg-surface-200 text-smoke-400">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="font-display text-xl font-bold text-bark-600">הוסיפי למסך הבית</h3>
              <p className="text-sm text-smoke-400 mt-1">3 שלבים פשוטים</p>
            </div>
            <div className="space-y-4">
              <Step n={1} icon={<Share className="w-4 h-4 text-blue-500" />} text='לחצי על כפתור השיתוף בתחתית Safari' />
              <Step n={2} icon={<Plus className="w-4 h-4 text-bark-500" />} text='גללי ובחרי "הוספה למסך הבית"' />
              <Step n={3} text='לחצי "הוספה" — האפליקציה תופיע במסך הבית' />
            </div>
          </div>
        </div>
      )}

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
            {showButton ? (
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-fire text-sm font-semibold shadow-warm transition-all"
              >
                <Download className="w-4 h-4" />
                {isIOS ? "הוסיפי למסך הבית" : "התקיני את האפליקציה"}
              </button>
            ) : !installed ? (
              <Link
                href="/install"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 border border-surface-400 text-sm text-bark-400 hover:border-cinnamon-400 hover:text-cinnamon-600 transition-all"
              >
                <Download className="w-4 h-4" />
                הורידי כאפליקציה
              </Link>
            ) : null}
          </div>
        </div>
      </footer>
    </>
  );
}

function Step({ n, text, icon }: { n: number; text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-cinnamon-50 text-cinnamon-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-bark-500">
        {icon && <span>{icon}</span>}
        {text}
      </div>
    </div>
  );
}
