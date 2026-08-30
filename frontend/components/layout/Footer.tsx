"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { usePWA } from "@/lib/usePWA";

const BookMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 14c0-1 1-2 2-2h18c2 0 4 1 5 3v34c-2-2-3-2-5-2H10c-1 0-2-1-2-2V14z" />
    <path d="M52 14c0-1-1-2-2-2H32c-2 0-4 1-5 3v34c2-2 3-2 5-2h18c1 0 2-1 2-2V14z" />
    <path d="M30 15v34" />
    <path d="M14 20h12M14 26h12M36 20h12M36 26h12" />
  </svg>
);

export default function Footer() {
  const { canInstall, install, isIOS } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleInstall = async () => {
    const result = await install();
    if (result === "ios") setShowIOSGuide(true);
  };

  return (
    <>
      {showIOSGuide && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center">
          <div className="absolute inset-0 bg-bark-500/50 backdrop-blur-sm" onClick={() => setShowIOSGuide(false)} />
          <div className="relative w-full max-w-sm card-surface border-t p-6 pb-12 animate-slide-up">
            <button onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-surface-300 text-bark-300">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-7">
              <BookMark className="w-10 h-10 mx-auto text-cinnamon-500 mb-4" />
              <h3 className="display-md text-bark-500">הוסיפו למסך הבית</h3>
              <p className="text-sm text-bark-200 mt-2">רק ב-Safari — 3 שלבים</p>
            </div>
            <div className="space-y-4">
              <Step n={1} icon={<Share className="w-4 h-4 text-cinnamon-500" />} text="לחצו על כפתור השיתוף בתחתית Safari" />
              <Step n={2} icon={<Plus className="w-4 h-4 text-bark-300" />} text='גללו ובחרו "הוספה למסך הבית"' />
              <Step n={3} text='לחצו "הוספה" — האפליקציה תופיע במסך הבית' />
            </div>
          </div>
        </div>
      )}

      <footer className="pb-24 sm:pb-20" style={{ background: "#efe7d7", borderTop: "1px solid #d9c79a" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <Link href="/" className="flex items-center gap-3 text-bark-500 hover:text-cinnamon-500 transition-colors">
              <BookMark className="w-8 h-8" />
              <span className="text-[19px] font-extrabold" style={{ letterSpacing: "-0.035em" }}>
                ספר המתכונים
              </span>
            </Link>
            <p className="text-bark-200 text-[15px] max-w-md">
              אוסף מתכונים ביתיים, נאסף באהבה
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold">
              <Link href="/pro" className="text-cinnamon-500 hover:text-cinnamon-600">גרסת פרו</Link>
              <Link href="/privacy" className="text-bark-300 hover:text-cinnamon-500">מדיניות פרטיות</Link>
              <Link href="/terms" className="text-bark-300 hover:text-cinnamon-500">תנאי שימוש</Link>
            </nav>

            {canInstall ? (
              <button onClick={handleInstall} className="btn-block">
                <Download className="w-4 h-4 ml-2" />
                {isIOS ? "הוסיפו למסך הבית" : "פתח במחשב"}
              </button>
            ) : (
              <Link href="/install" className="btn-block">
                <Download className="w-4 h-4 ml-2" />
                פתח במחשב
              </Link>
            )}

            <div className="text-[13px] text-bark-200">© 2026 ספר המתכונים — כל הזכויות שמורות</div>
          </div>
        </div>
      </footer>
    </>
  );
}

function Step({ n, text, icon }: { n: number; text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-cinnamon-50 text-cinnamon-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{n}</div>
      <div className="flex items-center gap-1.5 text-sm text-bark-300">
        {icon && <span>{icon}</span>}
        {text}
      </div>
    </div>
  );
}
