"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, Smartphone, Monitor, Check } from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function InstallPage() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else if (!(isIOS || isAndroid)) setPlatform("desktop");

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
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
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-10 animate-fade-up">
        <Logo size={88} priority className="mx-auto mb-5" />
        <span className="eyebrow mb-3 justify-center">
          <span className="plus-badge text-cinnamon-500">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
          </span>
          אפליקציה
        </span>
        <h1 className="display-lg text-bark-500 mb-2">הספר על המסך</h1>
        <p className="text-bark-300 text-sm">גישה מהירה מהמסך הראשי, בלי דפדפן</p>
      </div>

      {installed ? (
        <div className="card-surface p-8 text-center animate-fade-up">
          <div className="w-14 h-14 bg-cinnamon-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-cinnamon-600" />
          </div>
          <h2 className="section-title text-bark-500 mb-2">האפליקציה הותקנה</h2>
          <p className="text-bark-300 text-sm">תמצאו אותה במסך הבית</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
          {(installPrompt || platform === "android" || platform === "desktop") && (
            <div className="card-surface p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cinnamon-50 flex items-center justify-center">
                  {platform === "desktop" ? (
                    <Monitor className="w-5 h-5 text-cinnamon-600" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-cinnamon-600" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-bark-500 text-sm">
                    {platform === "desktop" ? "מחשב (Chrome / Edge)" : "Android"}
                  </h2>
                  <p className="text-xs text-bark-200">התקנה בלחיצה אחת</p>
                </div>
              </div>
              {installPrompt ? (
                <button onClick={handleInstall} className="w-full btn-block flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  התקנת האפליקציה
                </button>
              ) : (
                <div className="space-y-3">
                  <Step n={1} text="פתחו את האתר ב-Chrome" />
                  <Step n={2} text="לחצו על שלוש הנקודות בפינה" />
                  <Step n={3} text={'בחרו "הוספה למסך הבית" / Install App'} />
                </div>
              )}
            </div>
          )}

          {(platform === "ios" || platform === "unknown") && (
            <div className="card-surface p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cinnamon-50 flex items-center justify-center">
                  <Share className="w-5 h-5 text-cinnamon-600" />
                </div>
                <div>
                  <h2 className="font-bold text-bark-500 text-sm">iPhone / iPad (Safari)</h2>
                  <p className="text-xs text-bark-200">3 שלבים</p>
                </div>
              </div>
              <div className="space-y-3">
                <Step n={1} icon={<Share className="w-4 h-4" />} text="פתחו ב-Safari ולחצו על כפתור השיתוף" />
                <Step n={2} icon={<Plus className="w-4 h-4" />} text={'גללו ובחרו "הוספה למסך הבית"'} />
                <Step n={3} icon={<Check className="w-4 h-4" />} text={'לחצו "הוספה" — האפליקציה תופיע במסך הבית'} />
              </div>
            </div>
          )}

          <div className="card-surface p-5">
            <p className="eyebrow mb-4">למה כדאי</p>
            <ul className="space-y-2.5">
              {[
                "גישה מהירה ממסך הבית",
                "בלי שורת הכתובת",
                "נראה כמו אפליקציה",
                "בלי הורדה מ-App Store",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-bark-400">
                  <Check className="w-4 h-4 text-cinnamon-500 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ n, text, icon }: { n: number; text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-cinnamon-50 text-cinnamon-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-bark-400">
        {icon && <span className="text-cinnamon-500">{icon}</span>}
        {text}
      </div>
    </div>
  );
}
