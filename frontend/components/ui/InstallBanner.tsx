"use client";

import { useState, useEffect } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { usePWA } from "@/lib/usePWA";
import Logo from "@/components/brand/Logo";

export default function InstallBanner() {
  const { canInstall, install, isIOS } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
  if (typeof window !== "undefined") {
  setDismissed(localStorage.getItem("install-banner-dismissed") === "true");
  }
  }, []);

  const handleInstall = async () => {
  const result = await install();
  if (result === "ios") setShowIOSGuide(true);
  };

  const handleDismiss = () => {
  setDismissed(true);
  if (typeof window !== "undefined") {
  localStorage.setItem("install-banner-dismissed", "true");
  }
  };

  if (!canInstall || dismissed) return null;

  return (
  <>
  {showIOSGuide && (
  <div className="fixed inset-0 z-[300] flex items-end justify-center">
  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowIOSGuide(false)} />
  <div className="relative w-full max-w-sm bg-surface-50  border-t border-surface-400 shadow-warm-lg p-6 pb-12 animate-slide-up">
  <button onClick={() => setShowIOSGuide(false)} className="absolute top-4 left-4 p-1.5  hover:bg-surface-200 text-bark-300">
  <X className="w-5 h-5" />
  </button>
  <div className="text-center mb-6">
  <Logo size={64} className="mx-auto mb-3" />
  <h3 className="section-title text-bark-500">
  הוסיפו למסך הבית
  </h3>
  <p className="text-sm text-bark-300 mt-1">רק ב-Safari — שלושה שלבים</p>
  </div>
  <div className="space-y-4">
  <Step n={1} icon={<Share className="w-4 h-4 text-blue-500" />} text="לחצו על כפתור השיתוף בתחתית Safari" />
  <Step n={2} icon={<Plus className="w-4 h-4 text-bark-400" />} text={'גללו ובחרו "הוספה למסך הבית"'} />
  <Step n={3} text={'לחצו "הוספה" — הספר יופיע במסך הבית'} />
  </div>
  </div>
  </div>
  )}

  <div className="install-banner fixed bottom-20 sm:bottom-4 inset-x-4 sm:right-4 sm:left-auto sm:max-w-sm z-[100] animate-slide-up">
  <div className="card-surface p-3 flex items-center gap-3">
  <Logo size={40} className="flex-shrink-0" />
  <div className="flex-1 min-w-0">
  <p className="text-sm font-semibold text-bark-500">הוסיפו למסך הבית</p>
  <p className="text-xs text-bark-300">גישה מהירה, בלי דפדפן</p>
  </div>
  <button
  onClick={handleInstall}
  className="flex items-center gap-1.5 px-3 py-1.5 btn-block text-xs font-semibold shrink-0"
  >
  <Download className="w-3.5 h-3.5" />
  התקנה
  </button>
  <button onClick={handleDismiss} className="p-1.5  hover:bg-surface-200 text-bark-200 shrink-0">
  <X className="w-4 h-4" />
  </button>
  </div>
  </div>
  </>
  );
}

function Step({ n, text, icon }: { n: number; text: string; icon?: React.ReactNode }) {
  return (
  <div className="flex items-start gap-3">
  <div className="w-7 h-7 rounded-full bg-cinnamon-50 text-cinnamon-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{n}</div>
  <div className="flex items-center gap-1.5 text-sm text-bark-400">
  {icon && <span>{icon}</span>}
  {text}
  </div>
  </div>
  );
}
