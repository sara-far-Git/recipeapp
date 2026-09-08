"use client";

import { useEffect, useMemo, useState } from "react";
import { recipesApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeLoading from "@/components/ui/RecipeLoading";
import PageFrame from "@/components/ui/PageFrame";
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

  const chefs = useMemo(() => Array.from(new Map(recipes.map(r => [r.author.username, r.author])).values())
    .sort((a, b) => (a.full_name || a.username).localeCompare(b.full_name || b.username, "he")), [recipes]);
  const filtered = useMemo(() => recipes.filter(r =>
    (!chef || r.author.username === chef) && (!category || r.category === category) &&
    (!difficulty || r.difficulty === difficulty) && (!kosher || r.kosher_type === kosher) &&
    (!time || (r.prep_time_minutes != null && r.prep_time_minutes <= Number(time)))
  ), [recipes, chef, category, difficulty, kosher, time]);
  useEffect(() => { setVisibleCount(24); }, [chef, category, difficulty, kosher, time]);
  const clear = () => { setChef(""); setCategory(""); setDifficulty(""); setKosher(""); setTime(""); };

  return <PageFrame tone="forest">
    <header className="experience-hero mb-7">
      <span className="eyebrow mb-3">מהמטבחים של כולם</span>
      <h1 className="display-lg">כל המתכונים</h1>
      <p className="mt-3">כל המתכונים שפורסמו לקהילה. בוחרים שף, מסננים ומוצאים מה להכין.</p>
    </header>
    <section aria-label="סינון מתכונים" className="card-surface p-5 mb-7">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 catalog-filters">
        <label>שף<select value={chef} onChange={e => setChef(e.target.value)}><option value="">כל השפים</option>{chefs.map(c => <option key={c.username} value={c.username}>{c.full_name || c.username}</option>)}</select></label>
        <label>קטגוריה<select value={category} onChange={e => setCategory(e.target.value)}><option value="">כל הקטגוריות</option>{CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></label>
        <label>רמת קושי<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="">כל הרמות</option><option value="easy">קל</option><option value="medium">בינוני</option><option value="hard">מאתגר</option></select></label>
        <label>כשרות<select value={kosher} onChange={e => setKosher(e.target.value)}><option value="">כל הסוגים</option><option value="meat">בשרי</option><option value="dairy">חלבי</option><option value="pareve">פרווה</option></select></label>
        <label>זמן הכנה<select value={time} onChange={e => setTime(e.target.value)}><option value="">כל הזמנים</option><option value="15">עד 15 דקות</option><option value="30">עד 30 דקות</option><option value="60">עד שעה</option></select></label>
      </div>
      {(chef || category || difficulty || kosher || time) && <button onClick={clear} className="btn-outline mt-4">ניקוי סינונים</button>}
    </section>
    {loading ? <RecipeLoading /> : error ? <div role="alert" className="card-surface p-6"><p>לא הצלחנו לטעון את המתכונים.</p><button className="btn-block mt-4" onClick={() => setAttempt(a => a + 1)}>ניסיון נוסף</button></div> : <>
      <p role="status" className="mb-5">{filtered.length === 1 ? "מתכון אחד" : `${filtered.length} מתכונים`}</p>
      {filtered.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.slice(0, visibleCount).map(r => <RecipeCard key={r.id} recipe={r} />)}</div> : <p className="card-surface p-8">{recipes.length ? "אין מתכונים שמתאימים לסינון שבחרתם." : "עדיין לא פורסמו מתכונים. בקרוב יהיה כאן מה לבשל."}</p>}
      {visibleCount < filtered.length && <button className="btn-block mx-auto mt-8" onClick={() => setVisibleCount(n => n + 24)}>עוד מתכונים</button>}
    </>}
  </PageFrame>;
}
