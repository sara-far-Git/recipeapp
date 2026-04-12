"use client";

import { useEffect, useState, useCallback } from "react";
import { recipesApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Loader2, ChefHat, Flame, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function FeedPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadRecipes = useCallback(async (skip = 0) => {
    try {
      const { data } = await recipesApi.list(skip);
      if (skip === 0) setRecipes(data); else setRecipes((p) => [...p, ...data]);
      setHasMore(data.length === 20);
    } catch {} finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loadingMore) {
        setLoadingMore(true); loadRecipes(recipes.length);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  if (loading) {
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

      {/* Recipes */}
      {recipes.length === 0 ? (
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
