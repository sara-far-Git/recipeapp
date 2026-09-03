"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { usePWA } from "@/lib/usePWA";
import Logo from "@/components/brand/Logo";

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
              <Logo solid size={72} className="mx-auto mb-4" />
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

      <footer className="pb-24 sm:pb-20" style={{ background: "#FAF8F3", borderTop: "1px solid rgba(31,42,38,0.12)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <Link href="/" className="inline-flex" aria-label="ספר המתכונים — דף הבית">
              <Logo solid size={72} />
            </Link>
            <p className="text-cream-200 text-[15px] max-w-md">
              ספר המתכונים — המקום שבו המתכונים של הבית נשמרים, נמצאים, וחוזרים לשולחן.
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold">
              <Link href="/privacy" className="text-cream-200 hover:text-cinnamon-300 inline-flex items-center min-h-[24px]">מדיניות פרטיות</Link>
              <Link href="/terms" className="text-cream-200 hover:text-cinnamon-300 inline-flex items-center min-h-[24px]">תנאי שימוש</Link>
            </nav>

            {canInstall ? (
              <button onClick={handleInstall} className="btn-cream">
                <Download className="w-4 h-4 ml-2" />
                {isIOS ? "הוסיפו למסך הבית" : "פתח במחשב"}
              </button>
            ) : (
              <Link href="/install" className="btn-cream">
                <Download className="w-4 h-4 ml-2" />
                פתח במחשב
              </Link>
            )}

            <div className="text-[13px] text-cream-300">© 2026 ספר המתכונים — כל הזכויות שמורות</div>
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
