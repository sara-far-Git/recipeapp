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
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loadingMore) {
        setLoadingMore(true); loadRecipes(recipes.length);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, recipes.length, loadRecipes]);

  if (loading && recipes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center animate-pulse-glow text-4xl shadow-warm" style={{ background: "linear-gradient(135deg, #d47c3a, #9a4d20)" }}>
            🔥
          </div>
          <p className="text-sm text-bark-300 font-medium">טוען מתכונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero — dark espresso banner */}
      <div className="relative mb-10 rounded-3xl overflow-hidden animate-fade-up" style={{ background: "linear-gradient(145deg, #2c1a0e 0%, #3d2515 40%, #4d3018 100%)" }}>
        {/* Subtle warm glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px]" style={{ background: "rgba(212, 124, 58, 0.12)" }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-[80px]" style={{ background: "rgba(196, 133, 74, 0.08)" }} />
        </div>
        {/* Fine border */}
        <div className="absolute inset-0 rounded-3xl border border-white/[0.06]" />

        <div className="relative p-7 sm:p-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">📖</span>
            <span className="text-xs font-bold text-cinnamon-300/80 uppercase tracking-widest font-display">ספר המתכונים שלנו</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 leading-tight text-white/95">
            {user
              ? (<>שלום, <span className="text-fire">{user.full_name || user.username}</span> 👋</>)
              : (<>גלו מתכונים <span className="text-fire">מיוחדים</span></>)
            }
          </h1>
          <p className="text-cinnamon-100/60 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
            שתפו, גלו ובשלו מתכונים עם הקהילה. סרקו מתכון מספר, קבלו הצעות מ-AI, ובנו את ספר המתכונים שלכם.
          </p>

          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link href="/recipe/new" className="btn-fire px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 transition-all duration-200">
                <ChefHat className="w-4 h-4" /> מתכון חדש
              </Link>
            ) : (
              <Link href="/register" className="btn-fire px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 transition-all duration-200">
                הצטרפו עכשיו →
              </Link>
            )}
            <Link
              href="/search"
              className="px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 border border-white/[0.12] text-white/75 hover:bg-white/[0.06] hover:text-white/90 transition-all duration-200 active:scale-[0.96]"
            >
              חפשו מתכונים
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
              showFilters || hasFilters
                ? "btn-fire border-transparent text-white"
                : "bg-white border-surface-400 text-bark-400 hover:border-cinnamon-400 hover:text-cinnamon-600"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            סינון
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-white/25 text-xs flex items-center justify-center">
                {[difficulty, kosher, maxTime > 0].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-smoke-400 hover:text-bark-500 transition-colors">
              <X className="w-3.5 h-3.5" /> נקה הכל
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

      {/* Recipe grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-cinnamon-500" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-24 h-24 mx-auto mb-6 card-surface flex items-center justify-center rounded-3xl">
            <ChefHat className="w-12 h-12 text-bark-100" />
          </div>
          <h2 className="font-display text-2xl font-bold text-bark-600 mb-2">עדיין אין מתכונים</h2>
          <p className="text-smoke-400 mb-8">היו הראשונים לשתף מתכון עם הקהילה!</p>
          {user && (
            <Link href="/recipe/new" className="btn-fire px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 transition-all">
              <ChefHat className="w-4 h-4" /> יצירת מתכון ראשון
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6 animate-fade-up">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-cinnamon-400 to-cinnamon-600" />
            <h2 className="font-display text-xl font-bold text-bark-600">מתכונים אחרונים</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, i) => (
              <div key={recipe.id} className="animate-slide-up opacity-0" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
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

function FilterRow({ label, opts, active, onSelect }: { label: string; opts: { v: string | number; l: string }[]; active: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-bark-300 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button
            key={o.v}
            onClick={() => onSelect(String(o.v))}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              String(active) === String(o.v)
                ? "btn-fire border-transparent text-white"
                : "bg-surface-100 border-surface-400 text-bark-400 hover:border-cinnamon-400 hover:text-cinnamon-600"
            )}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}
