"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { searchApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import { ArrowRight, Loader2, ChefHat, Plus } from "lucide-react";

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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start gap-4 mb-10">
        <button
          onClick={() => router.back()}
          className="mt-2 p-2 hover:bg-surface-100 transition-colors text-bark-300 hover:text-bark-500"
          aria-label="חזרה"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <span className="eyebrow mb-3">
            <span className="plus-badge text-bark-500"><Plus className="w-3.5 h-3.5" strokeWidth={2.4} /></span>
            {CATEGORY_ICONS[name] ?? "🍴"} קטגוריה
          </span>
          <h1 className="display-lg text-bark-500">
            {name}
          </h1>
          {!loading && (
            <p className="text-sm text-bark-200 mt-2">
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
