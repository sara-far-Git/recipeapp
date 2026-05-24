"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { searchApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import { ArrowRight, Loader2, ChefHat } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  ראשונות: "🥗",
  עיקריות: "🍽️",
  מאפים: "🍞",
  קינוחים: "🍰",
  סלטים: "🥙",
  משקאות: "🥤",
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchApi
      .search({ category: name, limit: 100 })
      .then((res) => setRecipes(res.data))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [name]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-surface-100 transition-colors text-bark-300 hover:text-bark-500"
          aria-label="חזרה"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <span className="text-3xl">{CATEGORY_ICONS[name] ?? "🍴"}</span>
        <div>
          <h1
            className="text-2xl font-bold text-bark-500"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            {name}
          </h1>
          {!loading && (
            <p className="text-sm text-bark-200 mt-0.5">
              {recipes.length} מתכונים
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-cinnamon-400" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-24 text-bark-200">
          <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">אין עדיין מתכונים בקטגוריה זו</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
