"use client";

import { useState } from "react";
import { Check, Sparkles, Star, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";

const FREE_FEATURES = [
  "כל הכלים — אחרי התחברות",
  "שמירת מתכונים לאזור האישי",
  "סריקת תמונה עם AI — עד 3 בחודש",
  "חיפוש וגילוי מתכונים",
  "רשימת קניות",
  "המתכונים שלכם נשארים אצלכם",
];

const PRO_FEATURES = [
  { text: "פרסום מתכונים לכלל הקהילה, תחת השם של מי שמעלה", hot: true },
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
      <div className="text-center mb-12 animate-fade-up">
        <span className="eyebrow mb-4 justify-center">
          <span className="plus-badge text-cinnamon-500"><Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} /></span>
          בקרוב — Pro
        </span>
        <h1 className="display-lg text-bark-500 mb-3">
          הספר שלכם.<br />
          <span className="text-cinnamon-500">או של כולם.</span>
        </h1>
        <p className="text-bark-300 leading-relaxed max-w-lg mx-auto">
          בחינמי, אחרי התחברות, אפשר הכל — המתכונים נשארים אצלכם.
          ב־Pro כל מתכון שמעלים מתפרסם לקהילה תחת השם שלכם, ואפשר לקבל תגובות.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="card-surface p-6">
          <div className="mb-5">
            <p className="eyebrow mb-2">חינמי</p>
            <p className="display-md text-bark-500">₪0<span className="text-sm text-bark-200 font-normal"> / לחודש</span></p>
            <p className="text-sm text-bark-200 mt-2">למי שמחוברים</p>
          </div>
          <ul className="space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-bark-400">
                <Check className="w-4 h-4 text-cinnamon-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden p-6" style={{ background: "#3a2618" }}>
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="eyebrow mb-2" style={{ color: "#c47a52" }}>Pro</p>
                <p className="display-md text-surface-50">
                  ₪?<span className="text-sm font-normal" style={{ color: "#d4c8b6" }}> / לחודש</span>
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-bold" style={{ background: "#8b3a1f", color: "#f7f1e4", borderRadius: 2 }}>
                בקרוב
              </span>
            </div>
            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm" style={{ color: f.hot ? "#f7f1e4" : "#d4c8b6" }}>
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c47a52" }} />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card-surface p-7 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-cinnamon-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-cinnamon-600" />
            </div>
            <h3 className="section-title text-bark-500 mb-2">נרשמתם בהצלחה!</h3>
            <p className="text-bark-300 text-sm">נעדכן כש־Pro ייפתח.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-cinnamon-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-cinnamon-600" />
              </div>
              <div>
                <h3 className="font-bold text-bark-500">רשימת המתנה</h3>
                <p className="text-xs text-bark-200">גישה ראשונה כשנפתח</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="השם שלכם"
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
                className="w-full btn-block disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Star className="w-4 h-4" /> הצטרפות לרשימת ההמתנה</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
