"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { searchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Loader2, Plus } from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const params = useParams();
  const { user } = useAuth();
  const name = decodeURIComponent(params.name as string);
  const meta = getCategory(name);
  const others = CATEGORIES.filter((c) => c.name !== name);

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
      <div className="mb-10 animate-fade-up">
        <Link href="/#categories" className="eyebrow mb-4 hover:text-cinnamon-500 transition-colors">
          <span className="plus-badge text-bark-500">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
          </span>
          קטגוריה
        </Link>
        <h1 className="display-lg text-bark-500">{name}</h1>
        <p className="text-bark-300 text-lg mt-3 max-w-md leading-snug">
          {meta?.desc ?? "מתכונים לפי סוג מנה"}
        </p>
        {!loading && (
          <p className="text-sm text-bark-200 mt-3">
            {recipes.length === 0 ? "עדיין אין מתכונים כאן" : `${recipes.length} מתכונים`}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cinnamon-500" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="card-surface p-8 sm:p-10 mb-12">
            <p className="section-title text-bark-500 mb-2">הפרק הזה עדיין ריק</p>
            <p className="text-bark-300 text-sm leading-relaxed max-w-md mb-6">
              {meta?.desc ?? "עוד לא נכתב כאן כלום."} אפשר להתחיל במתכון ראשון, או לעבור לקטגוריה אחרת.
            </p>
            <Link href={user ? "/recipe/new" : "/login"} className="btn-block inline-flex">
              {user ? "כותבים מתכון" : "נכנסים כדי לכתוב"}
            </Link>
          </div>

          <p className="eyebrow mb-4">עוד באוסף</p>
          <div style={{ borderTop: "1px solid rgba(42,31,26,0.12)" }}>
            {others.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="group w-full text-right py-4 flex items-center gap-5 sm:gap-8 hover:bg-surface-100/70 transition-colors"
                style={{ borderBottom: "1px solid rgba(42,31,26,0.12)" }}
              >
                <span className="tabular text-sm w-8 text-bark-200">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-xl sm:text-2xl font-extrabold text-bark-500 group-hover:text-cinnamon-500 transition-colors"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {cat.name}
                </span>
                <span className="hidden sm:block flex-1 text-[15px] text-bark-200">
                  {cat.desc}
                </span>
                <span className={cn("plus-badge mr-auto text-bark-300 group-hover:text-cinnamon-500")}>
                  <Plus className="w-4 h-4" strokeWidth={2.4} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
            {recipes.map((recipe, i) => (
              <div key={recipe.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>

          <p className="eyebrow mb-4">עוד באוסף</p>
          <div className="flex flex-wrap gap-2">
            {others.map((cat) => (
              <Link
                key={cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="px-4 py-2 text-sm font-bold text-bark-400 border border-surface-400 hover:border-bark-500 hover:text-bark-500 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
