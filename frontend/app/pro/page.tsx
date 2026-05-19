"use client";

import { useState } from "react";
import { Check, Flame, Sparkles, Star, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

const FREE_FEATURES = [
  "שמירת מתכונים לאזור האישי",
  "סריקת תמונה עם AI — עד 3 בחודש",
  "חיפוש וגילוי מתכונים",
  "רשימת קניות",
];

const PRO_FEATURES = [
  { text: "פרסום מתכונים לכלל הקהילה", hot: true },
  { text: "קבלת תגובות מאחרים על המתכונים שלך", hot: true },
  { text: "סריקת AI ללא הגבלה", hot: false },
  { text: "ייבוא מתכונים מ-URL", hot: false },
  { text: "Collections — ניהול אוספי מתכונים", hot: false },
  { text: "עד 200 מתכונים (חינם: 20)", hot: false },
  { text: "תג Pro על הפרופיל", hot: false },
  { text: "תמיכה מועדפת", hot: false },
];

export default function ProPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.full_name || user?.username || "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const list = JSON.parse(localStorage.getItem("pro_waitlist") || "[]");
    list.push({ email, name, date: new Date().toISOString() });
    localStorage.setItem("pro_waitlist", JSON.stringify(list));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-2">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cinnamon-50 border border-cinnamon-200 text-cinnamon-600 text-xs font-bold mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          בקרוב — Pro
        </div>
        <h1 className="font-display text-4xl font-bold text-gray-100 mb-3">
          בשלי ושתפי עם <span className="text-fire">הקהילה</span>
        </h1>
        <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
          גרסת Pro מאפשרת לפרסם מתכונים לכלל המשתמשים, לקבל תגובות ולבנות קהל עוקבים.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {/* Free */}
        <div className="card-surface p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 font-semibold mb-1">חינמי</p>
            <p className="font-display text-3xl font-bold text-gray-200">₪0<span className="text-sm text-gray-500 font-normal"> / לחודש</span></p>
          </div>
          <ul className="space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-cinnamon-400/50 p-6" style={{ background: "linear-gradient(145deg, #8b3a1f 0%, #732d18 50%, #5a2412 100%)" }}>
          <div className="absolute top-0 right-0 w-40 h-40 blur-[60px] rounded-full" style={{ background: "rgba(245, 239, 226, 0.10)" }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-fire-400 font-bold mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Pro
                </p>
                <p className="font-display text-3xl font-bold text-gray-100">
                  ₪?<span className="text-sm text-gray-500 font-normal"> / לחודש</span>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cinnamon-400/20 text-cinnamon-300 text-xs font-bold border border-cinnamon-400/30">
                בקרוב
              </span>
            </div>
            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm">
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${f.hot ? "text-cinnamon-300" : "text-smoke-300"}`} />
                  <span className={f.hot ? "text-gray-200 font-medium" : "text-gray-400"}>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Waitlist */}
      <div className="card-surface p-7 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-cinnamon-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-cinnamon-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-100 mb-2">נרשמת בהצלחה!</h3>
            <p className="text-gray-400 text-sm">נעדכן אותך כשגרסת Pro תהיה זמינה.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cinnamon-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-cinnamon-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-100">הצטרפי לרשימת ההמתנה</h3>
                <p className="text-xs text-gray-500">קבלי גישה ראשונה + מחיר מוקדם</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="שמך"
                className="input-dark"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="כתובת אימייל *"
                required
                className="input-dark"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 rounded-2xl btn-fire font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Star className="w-4 h-4" /> הצטרפי לרשימת ההמתנה</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
