"use client";

import { useEffect, useMemo, useState } from "react";
import { chefName } from "@/lib/attribution";
import { recipesApi } from "@/lib/api";
import RecipeListJsonLd from "@/components/recipe/RecipeListJsonLd";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeLoading from "@/components/ui/RecipeLoading";
import PageFrame from "@/components/ui/PageFrame";
import { recipeMatchesCategory } from "@/lib/recipeSearch";
import { SlidersHorizontal, ChevronDown, X, SearchX } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

type Recipe = { id: number; title: string; category?: string; difficulty?: string; kosher_type?: string; prep_time_minutes?: number; author: { username: string; full_name?: string } };

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [chef, setChef] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [kosher, setKosher] = useState("");
  const [time, setTime] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        // This endpoint returns published recipes only, also for signed-in users.
        // Read every page so chef and other filters cover the entire public collection.
        const all: Recipe[] = [];
        for (let skip = 0; ; skip += 100) {
          const { data } = await recipesApi.list(skip, 100);
          if (cancelled) return;
          all.push(...data);
          if (data.length < 100) break;
        }
        setRecipes(Array.from(new Map(all.map(r => [r.id, r])).values()));
      } catch { if (!cancelled) setError(true); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [attempt]);

  const chefs = useMemo(() => Array.from(new Set(recipes.map(chefName).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "he")), [recipes]);
  const filtered = useMemo(() => recipes.filter(r =>
    (!chef || chefName(r) === chef) && (!category || recipeMatchesCategory(r, category)) &&
    (!difficulty || r.difficulty === difficulty) && (!kosher || r.kosher_type === kosher) &&
    (!time || (r.prep_time_minutes != null && r.prep_time_minutes <= Number(time)))
  ), [recipes, chef, category, difficulty, kosher, time]);
  useEffect(() => { setVisibleCount(24); }, [chef, category, difficulty, kosher, time]);
  const clear = () => { setChef(""); setCategory(""); setDifficulty(""); setKosher(""); setTime(""); };

  const activeFilters = [
    { value: chef, label: chef, clear: () => setChef("") },
    { value: category, label: category, clear: () => setCategory("") },
    { value: difficulty, label: ({ easy: "קל", medium: "בינוני", hard: "מאתגר" } as Record<string, string>)[difficulty], clear: () => setDifficulty("") },
    { value: kosher, label: ({ meat: "בשרי", dairy: "חלבי", pareve: "פרווה" } as Record<string, string>)[kosher], clear: () => setKosher("") },
    { value: time, label: `עד ${time} דקות הכנה`, clear: () => setTime("") },
  ].filter(filter => filter.value);

  return <PageFrame tone="forest">
    <header className="experience-hero mb-7">
      <span className="eyebrow mb-3">מהמטבחים של כולם</span>
      <h1 className="display-lg">כל המתכונים</h1>
      <p className="mt-3">כל המתכונים שפורסמו לקהילה. בוחרים שף, מסננים ומוצאים מה להכין.</p>
    </header>
    <section aria-label="סינון מתכונים" className="card-surface catalog-filter-panel p-4 sm:p-5 mb-7">
      <button type="button" className="catalog-filter-toggle" aria-expanded={filtersOpen} aria-controls="catalog-filter-fields" onClick={() => setFiltersOpen(open => !open)}>
        <SlidersHorizontal size={18} /><span>סינון מתכונים</span>
        {activeFilters.length > 0 && <span className="catalog-filter-count">{activeFilters.length}</span>}
        <ChevronDown size={18} className={filtersOpen ? "rotate-180" : ""} />
      </button>
      <div id="catalog-filter-fields" className={`${filtersOpen ? "grid" : "hidden"} sm:grid grid-cols-2 md:grid-cols-5 gap-4 catalog-filters`}>
        <label>שף<select value={chef} onChange={e => setChef(e.target.value)}><option value="">כל השפים</option>{chefs.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
        <label>קטגוריה<select value={category} onChange={e => setCategory(e.target.value)}><option value="">כל הקטגוריות</option>{CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></label>
        <label>רמת קושי<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="">כל הרמות</option><option value="easy">קל</option><option value="medium">בינוני</option><option value="hard">מאתגר</option></select></label>
        <label>כשרות<select value={kosher} onChange={e => setKosher(e.target.value)}><option value="">כל הסוגים</option><option value="meat">בשרי</option><option value="dairy">חלבי</option><option value="pareve">פרווה</option></select></label>
        <label>זמן הכנה<select value={time} onChange={e => setTime(e.target.value)}><option value="">כל הזמנים</option><option value="15">עד 15 דקות</option><option value="30">עד 30 דקות</option><option value="60">עד שעה</option></select></label>
      </div>
      {activeFilters.length > 0 && <div className="catalog-active-filters" aria-label="סינונים פעילים">
        {activeFilters.map((filter, index) => <button type="button" key={index} onClick={filter.clear} aria-label={`הסרת סינון ${filter.label}`}><span>{filter.label}</span><X size={14} /></button>)}
        <button type="button" onClick={clear} className="catalog-clear">ניקוי הכול</button>
      </div>}
    </section>
    {loading ? <RecipeLoading label="אוסף את המתכונים של הקהילה" /> : error ? <div role="alert" className="card-surface p-6"><p>לא הצלחנו לטעון את המתכונים.</p><button className="btn-block mt-4" onClick={() => setAttempt(a => a + 1)}>ניסיון נוסף</button></div> : <>
      <RecipeListJsonLd recipes={filtered.slice(0, visibleCount)} />
      <p role="status" className="mb-5">{filtered.length === 1 ? "מתכון אחד" : `${filtered.length} מתכונים`}</p>
      {filtered.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.slice(0, visibleCount).map(r => <RecipeCard key={r.id} recipe={r} />)}</div> : <div className="card-surface p-8 sm:p-12 text-center">
        <SearchX className="mx-auto mb-4 text-bark-400" size={32} strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-bark-500 mb-2">{recipes.length ? "לא מצאנו התאמה הפעם" : "המתכונים בדרך"}</h2>
        <p className="text-bark-300">{recipes.length ? "אפשר להסיר סינון אחד או להתחיל מחדש." : "עדיין לא פורסמו מתכונים. בקרוב יהיה כאן מה לבשל."}</p>
        {activeFilters.length > 0 && <button type="button" onClick={clear} className="btn-block mt-5 mx-auto">הצגת כל המתכונים</button>}
      </div>}
      {visibleCount < filtered.length && <button className="btn-block mx-auto mt-8" onClick={() => setVisibleCount(n => n + 24)}>עוד מתכונים</button>}
    </>}
  </PageFrame>;
}
