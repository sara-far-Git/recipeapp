"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  Camera,
  Check,
  Clock3,
  Link2,
  Mic,
  Sparkles,
  Star,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const PRO_PRICE = "₪19.90";
const EXTRA_PACK_PRICE = "₪9.90";

const HERO_STATS = [
  { label: "חינם", value: "3", note: "סריקות בחודש" },
  { label: "Pro", value: "30", note: "סריקות בחודש" },
  { label: "חבילה", value: "20", note: "סריקות נוספות" },
];

const WORKFLOW = [
  { icon: Camera, title: "מצלמים", text: "דף ממחברת, ספר ישן או צילום מסך." },
  { icon: Mic, title: "מספרים בקול", text: "הקלטה קצרה הופכת לשדות מסודרים." },
  { icon: Link2, title: "מדביקים קישור", text: "מתכון מבלוג נכנס ישר לטופס." },
];

const COMPARISON_ROWS = [
  { icon: Camera, label: "סריקות תמונה וקול", free: "3 בחודש", pro: "30 בחודש" },
  { icon: Link2, label: "ייבוא מתכונים מקישור", free: "מוגבל", pro: "כלול" },
  { icon: BookOpenCheck, label: "מתכונים באזור האישי", free: "עד 20", pro: "עד 200" },
  { icon: Users, label: "פרסום לקהילה", free: "קריאה ושמירה", pro: "פרסום, תגובות ודירוגים" },
  { icon: WalletCards, label: "חבילת סריקות", free: `${EXTRA_PACK_PRICE} ל־20`, pro: `${EXTRA_PACK_PRICE} ל־20 נוספות` },
];

export default function ProPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(user?.email || "");
    setName(user?.full_name || user?.username || "");
  }, [user?.email, user?.full_name, user?.username]);

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
    <div className="full-bleed -my-8 sm:-my-8 pro-experience">
      <section className="border-b border-bark-500/10 bg-forest-50">
        <div className="bleed-inner py-10 sm:py-14 lg:py-16">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] gap-10 lg:gap-16 items-center">
            <div className="animate-fade-up">
              <span className="eyebrow mb-5">
                <span className="plus-badge text-cinnamon-500"><Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} /></span>
                Pro למי שמעלה הרבה מתכונים
              </span>
              <h1 className="display-lg text-bark-500 max-w-3xl">
                ממחברת ישנה<br />
                <span className="text-cinnamon-500">למתכון מסודר בדקה.</span>
              </h1>
              <p className="mt-5 text-lg sm:text-xl font-medium text-bark-300 leading-snug max-w-2xl">
                החינם נשאר לשמירה ידנית ולכמה סריקות בחודש. Pro נועד לרגע שבו יש ערימה של
                דפים, הקלטות וקישורים שרוצים להכניס לספר בלי להקליד הכול מחדש.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#waitlist" className="btn-block gap-2">
                  <Star className="w-4 h-4" />
                  הצטרפות לרשימת ההמתנה
                </a>
                <Link href="/recipe/new" className="btn-outline gap-2">
                  לנסות את החינם
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-9 grid grid-cols-3 border-y border-bark-500/14">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className="py-4 px-3 border-l border-bark-500/10 last:border-l-0">
                    <p className="text-xs font-extrabold text-cinnamon-500">{stat.label}</p>
                    <p className="mt-1 text-3xl sm:text-4xl font-black text-bark-500 tabular-nums">{stat.value}</p>
                    <p className="text-xs sm:text-sm font-bold text-bark-200">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="relative border border-bark-500/12 bg-forest-100 p-3">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src="/food/hero-v2.png"
                    alt="קערת ירקות ומתכון ביתי"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 28rem"
                    priority
                  />
                </div>
                <div className="relative -mt-16 mx-4 bg-forest-50 border border-bark-500/12 p-4 shadow-warm-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold text-cinnamon-500">צילום מחברת</p>
                      <h2 className="text-xl font-black text-bark-500 leading-tight mt-1">עוגת תפוחים של שישי</h2>
                    </div>
                    <Sparkles className="w-5 h-5 text-cinnamon-500 flex-shrink-0" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {["כותרת", "מצרכים", "שלבים"].map((item) => (
                      <span key={item} className="border border-surface-400 bg-surface-50 px-2 py-2 text-xs font-extrabold text-bark-400">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-100 border-b border-bark-500/10">
        <div className="bleed-inner py-10 sm:py-14">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14 items-start">
            <div>
              <p className="eyebrow mb-4">
                <Clock3 className="w-4 h-4" />
                איפה הזמן נחסך
              </p>
              <h2 className="display-md text-bark-500">שלושה קיצורי דרך, אותו ספר מתכונים.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {WORKFLOW.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="border border-bark-500/12 bg-forest-50 p-5 min-h-[10rem]">
                    <Icon className="w-5 h-5 text-cinnamon-500 mb-4" strokeWidth={2.2} />
                    <h3 className="font-black text-bark-500 mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-bark-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-50 border-b border-bark-500/10">
        <div className="bleed-inner py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
            <div>
              <p className="eyebrow mb-3">מה מקבלים</p>
              <h2 className="display-md text-bark-500">יותר מקום ל־AI, בלי להקליד כל מתכון מחדש.</h2>
            </div>
            <div className="border border-bark-500/12 bg-forest-100 px-5 py-4 lg:min-w-[18rem]">
              <p className="text-xs font-extrabold text-cinnamon-500">Pro</p>
              <p className="text-3xl font-black text-bark-500 mt-1">
                {PRO_PRICE}<span className="text-sm font-bold text-bark-200"> / לחודש</span>
              </p>
              <p className="text-sm text-bark-300 mt-1">בקרוב לרשימת ההמתנה</p>
            </div>
          </div>

          <div className="border-y border-bark-500/14">
            <div className="grid grid-cols-[1fr_0.65fr_0.75fr] gap-3 px-3 py-3 text-xs font-extrabold text-bark-200">
              <span>יכולת</span>
              <span>חינם</span>
              <span>Pro</span>
            </div>
            {COMPARISON_ROWS.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="grid grid-cols-[1fr_0.65fr_0.75fr] gap-3 px-3 py-4 border-t border-bark-500/10 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 border border-cinnamon-500/35 bg-cinnamon-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-cinnamon-500" strokeWidth={2.2} />
                    </span>
                    <span className="text-sm sm:text-base font-black text-bark-500 leading-tight">{row.label}</span>
                  </div>
                  <span className="text-sm font-bold text-bark-300 leading-tight">{row.free}</span>
                  <span className="text-sm font-black text-bark-500 leading-tight">{row.pro}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="waitlist" className="bg-bark-600 text-forest-50">
        <div className="bleed-inner py-10 sm:py-14">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14 items-start">
            <div>
              <p className="eyebrow mb-4 text-cinnamon-300">
                <Zap className="w-4 h-4" />
                פתיחה הדרגתית
              </p>
              <h2 className="display-md text-forest-50">נכניס את Pro כשיהיה מספיק ביקוש.</h2>
              <p className="mt-4 text-forest-200 leading-relaxed max-w-lg">
                נפתח בהדרגה כדי לוודא שהסריקות נשארות מהירות, מדויקות וזמינות גם כשיותר אנשים מצטרפים.
              </p>

              <div className="mt-8 border-y border-forest-50/16">
                <div className="flex items-center justify-between gap-5 py-4 border-b border-forest-50/12">
                  <div>
                    <p className="text-xs font-extrabold text-cinnamon-300">חבילת סריקות</p>
                    <p className="text-lg font-black text-forest-50">20 סריקות נוספות</p>
                  </div>
                  <p className="text-2xl font-black tabular-nums">{EXTRA_PACK_PRICE}</p>
                </div>
                <div className="flex items-center gap-3 py-4 text-sm font-bold text-forest-200">
                  <Check className="w-4 h-4 text-cinnamon-300" />
                  מתאים גם למי שלא רוצה מנוי קבוע.
                </div>
              </div>
            </div>

            <div className="bg-forest-50 text-bark-500 border border-forest-50/20 p-6 sm:p-7">
              {submitted ? (
                <div className="text-center py-6">
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
                      <Star className="w-5 h-5 text-cinnamon-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-bark-500">רשימת המתנה ל־Pro</h3>
                      <p className="text-xs text-bark-200">גישה ראשונה כשהמנוי ייפתח</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-label="השם שלכם"
                      placeholder="השם שלכם"
                      className="input-dark"
                    />
                    <input
                      type="email"
                      aria-label="כתובת אימייל"
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
                        <div className="w-5 h-5 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin" />
                      ) : (
                        <><Star className="w-4 h-4" /> שמרו לי מקום</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
