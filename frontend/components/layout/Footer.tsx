"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { usePWA } from "@/lib/usePWA";

const BookMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className={className}>
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowIOSGuide(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl border-t border-surface-400 shadow-warm-lg p-6 pb-12 animate-slide-up">
            <button onClick={() => setShowIOSGuide(false)} className="absolute top-4 left-4 p-1.5 rounded-xl hover:bg-surface-200 text-bark-300">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <BookMark className="w-10 h-10 mx-auto text-cinnamon-500 mb-3" />
              <h3 className="text-xl font-bold text-bark-500" style={{ fontFamily: "Heebo, sans-serif", letterSpacing: "-0.02em" }}>
                הוסיפי למסך הבית
              </h3>
              <p className="text-sm text-bark-300 mt-1">רק ב-Safari — 3 שלבים</p>
            </div>
            <div className="space-y-4">
              <Step n={1} icon={<Share className="w-4 h-4 text-blue-500" />} text='לחצי על כפתור השיתוף בתחתית Safari' />
              <Step n={2} icon={<Plus className="w-4 h-4 text-bark-400" />} text='גללי ובחרי "הוספה למסך הבית"' />
              <Step n={3} text='לחצי "הוספה" — האפליקציה תופיע במסך הבית' />
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 pb-24 sm:pb-0" style={{ background: "#f5efe2", borderTop: "1px solid #d9c79a" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <BookMark className="w-8 h-8 text-bark-500" />
              <span className="text-xl font-bold text-bark-500 italic" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
                Recipes Book
              </span>
            </div>

            <p className="text-sm text-bark-300 max-w-md" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
              אוסף מתכונים ביתיים, נאסף באהבה
            </p>

            <div className="flex items-center justify-center gap-3 w-full max-w-xs">
              <span className="flex-1 h-px" style={{ background: "#d9c79a" }} />
              <span className="text-bark-200">✦</span>
              <span className="flex-1 h-px" style={{ background: "#d9c79a" }} />
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest font-semibold">
              <Link href="/pro" className="text-cinnamon-500 hover:text-cinnamon-600 transition-colors">גרסת פרו</Link>
              <Link href="/privacy" className="text-bark-300 hover:text-cinnamon-500 transition-colors">מדיניות פרטיות</Link>
              <Link href="/terms" className="text-bark-300 hover:text-cinnamon-500 transition-colors">תנאי שימוש</Link>
            </nav>

            {canInstall ? (
              <button onClick={handleInstall} className="flex items-center gap-2 px-6 py-2.5 rounded-md btn-fire text-sm font-semibold transition-all uppercase tracking-widest">
                <Download className="w-4 h-4" />
                {isIOS ? "הוסיפי למסך הבית" : "התקיני כאפליקציה"}
              </button>
            ) : (
              <Link href="/install" className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all uppercase tracking-widest text-bark-400 hover:text-cinnamon-500"
                style={{ border: "1px solid #d9c79a" }}>
                <Download className="w-4 h-4" />
                הורידי כאפליקציה
              </Link>
            )}

            <div className="text-xs text-bark-200 mt-2">© 2026 Recipes Book — כל הזכויות שמורות</div>
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
      <div className="flex items-center gap-1.5 text-sm text-bark-400">
        {icon && <span>{icon}</span>}
        {text}
      </div>
    </div>
  );
}
