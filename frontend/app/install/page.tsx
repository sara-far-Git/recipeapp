"use client";

import { useEffect, useState } from "react";
import { Download, Share, MoreVertical, Plus, Smartphone, Monitor, Check } from "lucide-react";

export default function InstallPage() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");

  useEffect(() => {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isMobile = isIOS || isAndroid;
  if (isIOS) setPlatform("ios");
  else if (isAndroid) setPlatform("android");
  else if (!isMobile) setPlatform("desktop");

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
  <div className="max-w-lg mx-auto py-8 px-2">
  <div className="text-center mb-10 animate-fade-up">
  <div className="w-20 h-20  mx-auto mb-5 flex items-center justify-center shadow-warm-md" style={{ background: "#8b3a1f" }}>
  <svg width="44" height="44" viewBox="0 0 60 60" fill="none" stroke="#efe7d7" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M8 14c0-1 1-2 2-2h18c2 0 4 1 5 3v34c-2-2-3-2-5-2H10c-1 0-2-1-2-2V14z" />
  <path d="M52 14c0-1-1-2-2-2H32c-2 0-4 1-5 3v34c2-2 3-2 5-2h18c1 0 2-1 2-2V14z" />
  <path d="M30 15v34" />
  </svg>
  </div>
  <h1 className="font-display text-3xl font-bold text-bark-500 mb-2">התקיני את Recipes Book</h1>
  <p className="text-bark-300 text-sm">גישה מהירה מהמסך הראשי, ללא דפדפן</p>
  </div>

  {installed ? (
  <div className="card-surface p-8 text-center animate-fade-up">
  <div className="w-16 h-16  bg-green-50 flex items-center justify-center mx-auto mb-4">
  <Check className="w-8 h-8 text-green-600" />
  </div>
  <h2 className="font-bold text-gray-100 text-lg mb-2">האפליקציה הותקנה!</h2>
  <p className="text-gray-400 text-sm">תמצאי אותה במסך הבית שלך</p>
  </div>
  ) : (
  <div className="space-y-4 animate-fade-up" style={{ animationDelay: "80ms" }}>

  {/* Android / Desktop — auto prompt */}
  {(installPrompt || platform === "android" || platform === "desktop") && (
  <div className="card-surface p-5">
  <div className="flex items-center gap-3 mb-4">
  <div className="w-10 h-10  bg-cinnamon-50 flex items-center justify-center">
  {platform === "desktop" ? <Monitor className="w-5 h-5 text-cinnamon-600" /> : <Smartphone className="w-5 h-5 text-cinnamon-600" />}
  </div>
  <div>
  <h2 className="font-bold text-gray-100 text-sm">
  {platform === "desktop" ? "מחשב (Chrome / Edge)" : "Android"}
  </h2>
  <p className="text-xs text-gray-500">התקנה בלחיצה אחת</p>
  </div>
  </div>
  {installPrompt ? (
  <button onClick={handleInstall} className="w-full py-3.5  btn-fire font-bold text-white flex items-center justify-center gap-2">
  <Download className="w-5 h-5" />
  התקיני את האפליקציה
  </button>
  ) : (
  <div className="space-y-3 text-sm text-gray-400">
  <Step n={1} text='פתחי את האתר ב-Chrome' />
  <Step n={2} text='לחצי על שלוש הנקודות ⋮ בפינה הימנית העליונה' />
  <Step n={3} text='בחרי "הוספה למסך הבית" / "Install App"' />
  </div>
  )}
  </div>
  )}

  {/* iOS instructions */}
  {(platform === "ios" || platform === "unknown") && (
  <div className="card-surface p-5">
  <div className="flex items-center gap-3 mb-4">
  <div className="w-10 h-10  bg-surface-200 flex items-center justify-center">
  <svg width="22" height="22" viewBox="0 0 60 60" fill="none" stroke="#8b3a1f" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M8 14c0-1 1-2 2-2h18c2 0 4 1 5 3v34c-2-2-3-2-5-2H10c-1 0-2-1-2-2V14z" />
  <path d="M52 14c0-1-1-2-2-2H32c-2 0-4 1-5 3v34c2-2 3-2 5-2h18c1 0 2-1 2-2V14z" />
  </svg>
  </div>
  <div>
  <h2 className="font-bold text-gray-100 text-sm">iPhone / iPad (Safari)</h2>
  <p className="text-xs text-gray-500">3 שלבים פשוטים</p>
  </div>
  </div>
  <div className="space-y-3">
  <Step n={1} icon={<Share className="w-4 h-4" />} text='פתחי את האתר ב-Safari ולחצי על כפתור השיתוף' />
  <Step n={2} icon={<Plus className="w-4 h-4" />} text='גללי למטה ובחרי "הוספה למסך הבית"' />
  <Step n={3} icon={<Check className="w-4 h-4" />} text='לחצי "הוספה" — האפליקציה תופיע במסך הבית' />
  </div>
  </div>
  )}

  {/* Benefits */}
  <div className="card-surface p-5">
  <h3 className="font-bold text-gray-200 text-sm mb-3">יתרונות האפליקציה</h3>
  <ul className="space-y-2">
  {[
  "גישה מהירה ממסך הבית",
  "חוויה מלאה ללא שורת הכתובת",
  "נראה ומרגיש כמו אפליקציה אמיתית",
  "ללא הורדה מ-App Store",
  ].map((b) => (
  <li key={b} className="flex items-center gap-2.5 text-sm text-gray-400">
  <Check className="w-4 h-4 text-cinnamon-600 flex-shrink-0" />
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
  <div className="w-6 h-6 rounded-full bg-fire-500/15 text-cinnamon-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
  {n}
  </div>
  <div className="flex items-center gap-1.5 text-sm text-gray-400">
  {icon && <span className="text-gray-500">{icon}</span>}
  {text}
  </div>
  </div>
  );
}
