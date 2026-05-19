"use client";

import { useState } from "react";
import { Download, Share, Plus, X, Smartphone } from "lucide-react";
import { usePWA } from "@/lib/usePWA";

export default function InstallBanner() {
  const { canInstall, install, isIOS } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const result = await install();
    if (result === "ios") setShowIOSSteps(true);
  };

  return (
    <>
      {/* iOS popup */}
      {showIOSSteps && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowIOSSteps(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl border-t border-surface-300 shadow-warm-lg p-6 pb-12">
            <button onClick={() => setShowIOSSteps(false)} className="absolute top-4 left-4 p-1.5 rounded-xl hover:bg-surface-200 text-smoke-400">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="font-display text-xl font-bold text-bark-600">הוסיפי למסך הבית</h3>
              <p className="text-sm text-smoke-400 mt-1">רק ב-Safari — 3 שלבים פשוטים</p>
            </div>
            <div className="space-y-4">
              <IOSStep n={1} icon={<Share className="w-4 h-4 text-blue-500" />} text='לחצי על כפתור השיתוף  בתחתית Safari' />
              <IOSStep n={2} icon={<Plus className="w-4 h-4 text-bark-500" />} text='גללי למטה ובחרי "הוספה למסך הבית"' />
              <IOSStep n={3} text='לחצי "הוספה" — האפליקציה תופיע במסך הבית 🎉' />
            </div>
          </div>
        </div>
      )}

      {/* Install banner */}
      <div className="fixed bottom-20 sm:bottom-6 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-warm-lg border border-surface-400 bg-white animate-slide-up max-w-sm w-full"
          style={{ animationDelay: "1500ms" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: "linear-gradient(135deg, #d47c3a, #9a4d20)" }}>
            🔥
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-bark-600 leading-tight">RecipeApp</p>
            <p className="text-xs text-smoke-400 leading-tight">
              {isIOS ? "הוסיפי למסך הבית" : "התקיני כאפליקציה — חינם"}
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-xl btn-fire text-xs font-bold"
          >
            {isIOS ? "איך?" : "התקנה"}
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 text-smoke-300 hover:text-smoke-500 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

function IOSStep({ n, text, icon }: { n: number; text: string; icon?: React.ReactNode }) {
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
