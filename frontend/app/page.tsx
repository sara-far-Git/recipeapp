"use client";

import { useEffect, useState, useCallback } from "react";
import { recipesApi, searchApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Loader2, ChefHat, SlidersHorizontal, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DIFFICULTY_OPTS = [{ v: "", l: "כל הרמות" }, { v: "easy", l: "קל" }, { v: "medium", l: "בינוני" }, { v: "hard", l: "מאתגר" }];
const KOSHER_OPTS = [{ v: "", l: "כל הסוגים" }, { v: "meat", l: "בשרי" }, { v: "dairy", l: "חלבי" }, { v: "pareve", l: "פרווה" }];
const TIME_OPTS = [{ v: 0, l: "כל הזמנים" }, { v: 15, l: "עד 15 דק'" }, { v: 30, l: "עד 30 דק'" }, { v: 60, l: "עד שעה" }];

export default function FeedPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [kosher, setKosher] = useState("");
  const [maxTime, setMaxTime] = useState(0);
  const scrollY = useScrollY();

  const hasFilters = difficulty || kosher || maxTime > 0;

  const loadRecipes = useCallback(async (skip = 0, diff = difficulty, kosh = kosher, time = maxTime) => {
    try {
      let data: any[];
      if (diff || kosh || time) {
        const res = await searchApi.search({ difficulty: diff || undefined, kosher_type: kosh || undefined, max_prep_time: time || undefined, skip, limit: 20 });
        data = res.data;
      } else {
        const res = await recipesApi.list(skip);
        data = res.data;
      }
      if (skip === 0) setRecipes(data); else setRecipes((p) => [...p, ...data]);
      setHasMore(data.length === 20);
    } catch {} finally { setLoading(false); setLoadingMore(false); }
  }, [difficulty, kosher, maxTime]);

  useEffect(() => { setLoading(true); loadRecipes(0, difficulty, kosher, maxTime); }, [difficulty, kosher, maxTime]);

  const clearFilters = () => { setDifficulty(""); setKosher(""); setMaxTime(0); };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loadingMore) {
          setLoadingMore(true); loadRecipes(recipes.length);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, recipes.length, loadRecipes]);

  if (loading && recipes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-up">
          <BookMark size={56} className="mx-auto mb-4 text-cinnamon-500 animate-float" />
          <p className="text-sm text-bark-300 font-medium">טוען מתכונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── INTRO (small welcome banner) ── */}
      <section className="text-center py-16 sm:py-20 animate-fade-up">
        <div className="inline-flex items-center gap-4 text-xs sm:text-sm font-semibold uppercase mb-5"
          style={{ color: "#5a3e2a", letterSpacing: "0.28em", fontFamily: "'Heebo', sans-serif" }}>
          <span className="inline-block w-12 sm:w-16 h-px" style={{ background: "#b8a385" }} />
          ברוכים הבאים
          <span className="inline-block w-12 sm:w-16 h-px" style={{ background: "#b8a385" }} />
        </div>
        <h1 className="text-bark-500 mb-3" style={{ fontFamily: "'Heebo', sans-serif", fontSize: "clamp(2.2rem,4.8vw,3.4rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
          {user ? <>שלום, <span className="text-cinnamon-500">{user.full_name || user.username}</span></> : <>המטבח של הבית, אצלכם.</>}
        </h1>
        <p className="text-bark-300 max-w-xl mx-auto text-base sm:text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
          דפדפו, גלו, בשלו — מתכונים שעוברים אצלנו במשפחה דורות.
        </p>
      </section>

      {/* ── HERO with parallax (centerpiece) ── */}
      <section className="hero-section relative mb-16 overflow-hidden" style={{ height: "92vh", minHeight: 680, borderRadius: 20 }}>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, #c89668 0%, #a06f3f 50%, #6b4423 100%)",
          transform: `translate3d(0,${-scrollY * 0.5}px,0)`,
          inset: "-12% 0",
          willChange: "transform",
        }} />
        <div className="absolute inset-0" style={{ background: "rgba(58,38,24,0.32)", zIndex: 1 }} />

        {/* Floating decorative icons with parallax */}
        <DecorIcons scrollY={scrollY} />

        {/* Hero content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
          style={{ transform: `translate3d(0,${-scrollY * 0.25}px,0)`, willChange: "transform" }}>
          <div className="inline-flex items-center gap-4 text-xs font-semibold uppercase mb-6"
            style={{ color: "rgba(245,239,226,0.95)", letterSpacing: "0.32em", fontFamily: "'Heebo', sans-serif" }}>
            <span className="inline-block w-14 h-px" style={{ background: "rgba(245,239,226,0.7)" }} />
            ספר המתכונים שלי
            <span className="inline-block w-14 h-px" style={{ background: "rgba(245,239,226,0.7)" }} />
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.6rem,6vw,5rem)", fontWeight: 400, letterSpacing: "0.18em",
            color: "#fff", lineHeight: 1, marginBottom: 10,
            textShadow: "0 2px 16px rgba(0,0,0,0.4)",
          }}>
            — RECIPES —
          </h2>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.2rem,5vw,4.2rem)", fontWeight: 900, letterSpacing: "0.04em",
            color: "#faf3e3", lineHeight: 1, marginBottom: 28,
            textShadow: "0 2px 16px rgba(0,0,0,0.4)",
          }}>
            BOOK
          </div>
          <p className="max-w-xl text-base sm:text-lg leading-relaxed mb-9"
            style={{ color: "rgba(245,239,226,0.92)", fontFamily: "'Heebo', sans-serif", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
            אוסף מתכונים ביתיים, מסורת משפחתית וטעמי הילדות —<br />מהמטבח שלנו אליכם.
          </p>
          <Link href={user ? "/recipe/new" : "/register"}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-md text-sm font-semibold transition-all duration-200"
            style={{
              background: "transparent", color: "#fff", border: "1.5px solid #fff",
              letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'Heebo', sans-serif",
            }}>
            {user ? "מתכון חדש" : "הצטרפו עכשיו"}
            <ArrowLeft />
          </Link>
        </div>
      </section>

      {/* ── Filters ─────────────────────────── */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
              showFilters || hasFilters
                ? "btn-fire border-transparent text-white"
                : "bg-white border-surface-400 text-bark-400 hover:border-cinnamon-400 hover:text-cinnamon-600"
            )}>
            <SlidersHorizontal className="w-4 h-4" />
            סינון
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-white/25 text-xs flex items-center justify-center">
                {[difficulty, kosher, maxTime > 0].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-bark-300 hover:text-cinnamon-500 transition-colors">
              <X className="w-3.5 h-3.5" />נקה הכל
            </button>
          )}
        </div>

        {showFilters && (
          <div className="card-surface mt-3 p-4 space-y-4 animate-fade-up">
            <FilterRow label="רמת קושי" opts={DIFFICULTY_OPTS} active={difficulty} onSelect={setDifficulty} />
            <FilterRow label="כשרות" opts={KOSHER_OPTS} active={kosher} onSelect={setKosher} />
            <FilterRow label="זמן הכנה" opts={TIME_OPTS} active={String(maxTime)} onSelect={(v) => setMaxTime(Number(v))} />
          </div>
        )}
      </div>

      {/* ── Recipe grid ─────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-cinnamon-500" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-24 h-24 mx-auto mb-6 card-surface flex items-center justify-center rounded-3xl">
            <ChefHat className="w-12 h-12 text-bark-100" />
          </div>
          <h2 className="text-2xl font-bold text-bark-500 mb-2" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
            עדיין אין מתכונים
          </h2>
          <p className="text-bark-300 mb-8">היו הראשונים לשתף מתכון עם הקהילה!</p>
          {user && (
            <Link href="/recipe/new" className="px-7 py-3 rounded-md text-sm font-semibold inline-flex items-center gap-2 btn-fire transition-all uppercase tracking-widest">
              <ChefHat className="w-4 h-4" />יצירת מתכון ראשון
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4 mb-9 animate-fade-up text-center">
            <span className="inline-block h-px flex-1 max-w-[80px]" style={{ background: "#b8a385" }} />
            <h2 className="text-2xl sm:text-3xl font-bold text-bark-500" style={{ fontFamily: "'Heebo', sans-serif", letterSpacing: "-0.02em" }}>
              מתכונים נבחרים
            </h2>
            <span className="inline-block h-px flex-1 max-w-[80px]" style={{ background: "#b8a385" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, i) => (
              <div key={recipe.id} className="animate-slide-up opacity-0"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </>
      )}

      {loadingMore && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-cinnamon-500" />
        </div>
      )}
    </div>
  );
}

// ── Scroll hook for parallax ──
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = 0; });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return y;
}

// ── Hand-drawn book mark icon ──
function BookMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 14c0-1 1-2 2-2h18c2 0 4 1 5 3v34c-2-2-3-2-5-2H10c-1 0-2-1-2-2V14z" />
      <path d="M52 14c0-1-1-2-2-2H32c-2 0-4 1-5 3v34c2-2 3-2 5-2h18c1 0 2-1 2-2V14z" />
      <path d="M30 15v34" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// ── Floating decorative icons with parallax ──
function DecorIcons({ scrollY }: { scrollY: number }) {
  const items = [
    { top: "4%", left: "3%", w: 180, h: 220, speed: 0.5, rot: 0.15,
      path: <><path d="M32 6c-2 14 2 18 0 24"/><path d="M20 30c-6 10 0 24 12 30 12-6 18-20 12-30-6 4-6 10-12 10s-6-6-12-10z"/></> },
    { top: "8%", right: "4%", w: 200, h: 200, speed: 0.75, rot: -0.25,
      path: <><path d="M32 8v32"/><path d="M18 40c0 14 6 18 14 18s14-4 14-18"/><path d="M22 40c0 12 4 16 10 16s10-4 10-16"/><circle cx="32" cy="6" r="3"/></> },
    { top: "38%", left: "2%", w: 220, h: 140, speed: -1.4, rot: 0.5,
      path: <><rect x="6" y="20" width="52" height="8" rx="2"/><rect x="14" y="28" width="36" height="6" rx="1"/></> },
    { top: "30%", right: "2%", w: 170, h: 200, speed: 1.8, rot: -0.6,
      path: <><ellipse cx="32" cy="38" rx="14" ry="20"/><path d="M28 18c-2-4 2-10 4-12M32 16c2-2 6-2 8 0"/></> },
    { top: "70%", left: "6%", w: 180, h: 200, speed: 1.3, rot: 0.7,
      path: <><path d="M22 12l-2 40c0 4 2 6 6 6h12c4 0 6-2 6-6l-2-40"/><path d="M22 12h20l-4-6H26z"/></> },
    { top: "62%", right: "7%", w: 200, h: 180, speed: -1.0, rot: -0.4,
      path: <><path d="M14 22h32v18c0 6-4 10-10 10H24c-6 0-10-4-10-10V22z"/><path d="M22 14v6M30 12v8M38 14v6"/></> },
    { top: "18%", left: "40%", w: 60, h: 60, speed: 2.5, rot: 1.2,
      path: <path d="M32 8c-4 8-12 12-12 22s6 18 12 18 12-8 12-18c0-10-8-14-12-22z"/> },
    { top: "55%", left: "48%", w: 70, h: 80, speed: -2.0, rot: -1.5,
      path: <><ellipse cx="32" cy="14" rx="10" ry="6"/><path d="M22 14c0 14 4 32 10 32s10-18 10-32"/></> },
  ];
  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {items.map((it, i) => (
        <svg key={i} width={it.w} height={it.h} viewBox="0 0 64 80" fill="none"
          stroke="rgba(255,255,255,0.95)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
          className="absolute"
          style={{
            top: it.top, left: it.left as any, right: it.right as any,
            transform: `translate3d(0,${-scrollY * it.speed}px,0) rotate(${scrollY * it.rot}deg)`,
            willChange: "transform",
            opacity: 0.9,
            filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.3))",
          }}>
          {it.path}
        </svg>
      ))}
    </div>
  );
}

function FilterRow({ label, opts, active, onSelect }: { label: string; opts: { v: string | number; l: string }[]; active: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-bark-300 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={o.v} onClick={() => onSelect(String(o.v))}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              String(active) === String(o.v) ? "btn-fire border-transparent text-white" : "bg-white border-surface-400 text-bark-400 hover:border-cinnamon-400 hover:text-cinnamon-600"
            )}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}
