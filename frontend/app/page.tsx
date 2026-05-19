"use client";

import { useEffect, useState, useCallback } from "react";
import { recipesApi, searchApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Loader2, ChefHat, Flame, Sparkles, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-fire-300 via-fire-500 to-ember-400 flex items-center justify-center animate-pulse-glow">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-smoke-400 font-medium">טוען מתכונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative mb-10 rounded-3xl overflow-hidden animate-fade-up">
        <div className="absolute inset-0 bg-gradient-to-bl from-surface-100 via-surface to-surface-300" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-fire-500/8 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-ember-500/5 blur-[100px]" />
        </div>
        <div className="absolute inset-0 border border-white/[0.04] rounded-3xl" />

        <div className="relative p-7 sm:p-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-fire-500/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-fire-300" />
            </div>
            <span className="text-xs font-bold text-fire-300/70 uppercase tracking-widest">Recipe App</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 leading-tight text-gray-100">
            {user ? (<>שלום, <span className="text-fire">{user.full_name || user.username}</span></>) : (<>גלו מתכונים <span className="text-fire">מדהימים</span></>)}
          </h1>
          <p className="text-smoke-300 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
            שתפו, גלו ובשלו מתכונים עם הקהילה. סרקו מתכון מספר, קבלו הצעות מ-AI, ובנו את ספר המתכונים שלכם.
          </p>

          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link href="/recipe/new" className="btn-fire px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 transition-all duration-200">
                <ChefHat className="w-4 h-4" /> מתכון חדש
              </Link>
            ) : (
              <Link href="/register" className="btn-fire px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 transition-all duration-200">
                הצטרפו עכשיו <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <Link href="/search" className="px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 bg-white/[0.05] text-smoke-200 border border-white/[0.07] hover:bg-white/[0.08] transition-all duration-200 active:scale-[0.96]">
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
                : "bg-surface-200 border-white/[0.06] text-gray-400 hover:border-white/[0.1]"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            סינון
            {hasFilters && <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
              {[difficulty, kosher, maxTime > 0].filter(Boolean).length}
            </span>}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <X className="w-3.5 h-3.5" /> נקה הכל
            </button>
          )}
        </div>

        {showFilters && (
          <div className="card-surface mt-3 p-4 space-y-4 animate-fade-up">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">רמת קושי</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_OPTS.map((o) => (
                  <button key={o.v} onClick={() => setDifficulty(o.v)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      difficulty === o.v ? "btn-fire border-transparent text-white" : "bg-surface-300 border-white/[0.06] text-gray-400 hover:border-white/[0.1]"
                    )}>{o.l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">כשרות</p>
              <div className="flex flex-wrap gap-2">
                {KOSHER_OPTS.map((o) => (
                  <button key={o.v} onClick={() => setKosher(o.v)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      kosher === o.v ? "btn-fire border-transparent text-white" : "bg-surface-300 border-white/[0.06] text-gray-400 hover:border-white/[0.1]"
                    )}>{o.l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">זמן הכנה</p>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTS.map((o) => (
                  <button key={o.v} onClick={() => setMaxTime(o.v)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      maxTime === o.v ? "btn-fire border-transparent text-white" : "bg-surface-300 border-white/[0.06] text-gray-400 hover:border-white/[0.1]"
                    )}>{o.l}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipes */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-fire-400" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="w-24 h-24 mx-auto mb-6 card-surface flex items-center justify-center rounded-3xl">
            <ChefHat className="w-12 h-12 text-smoke-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-200 mb-2">עדיין אין מתכונים</h2>
          <p className="text-smoke-400 mb-8">היו הראשונים לשתף מתכון עם הקהילה!</p>
          {user && (
            <Link href="/recipe/new" className="btn-fire px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 transition-all"><ChefHat className="w-4 h-4" /> יצירת מתכון ראשון</Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6 animate-fade-up">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-fire-400 to-ember-500" />
            <h2 className="font-display text-xl font-bold text-gray-200">מתכונים אחרונים</h2>
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
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-fire-400" /></div>
      )}
    </div>
  );
}
