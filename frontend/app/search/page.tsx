"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchApi, suggestApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeLoading from "@/components/ui/RecipeLoading";
import PageFrame from "@/components/ui/PageFrame";
import { Search, SlidersHorizontal, X, Loader2, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";

const DIFFICULTY_FILTERS = [
  { value: "", label: "הכל" },
  { value: "easy", label: "קל" },
  { value: "medium", label: "בינוני" },
  { value: "hard", label: "מאתגר" },
];

const KOSHER_FILTERS = [
  { value: "", label: "הכל" },
  { value: "meat", label: "בשרי" },
  { value: "dairy", label: "חלבי" },
  { value: "pareve", label: "פרווה" },
];

const TIME_FILTERS = [
  { value: 0, label: "הכל" },
  { value: 15, label: "עד 15 דק׳" },
  { value: 30, label: "עד 30 דק׳" },
  { value: 60, label: "עד שעה" },
];
const QUICK_SEARCHES = ["עוף", "פסטה", "עוגת שוקולד", "סלט", "אורז", "מרק"];
const QUICK_INGREDIENTS = ["ביצים", "גבינה", "תפוח אדמה", "טונה", "עגבניות", "קמח"];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState("");
  const [kosherType, setKosherType] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [ingredientMode, setIngredientMode] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientTags, setIngredientTags] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[] | null>(null);

  const doSearch = useCallback(async (q: string, diff: string, kosh: string, time: number, cat: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params: any = {};
      if (q) params.q = q;
      if (diff) params.difficulty = diff;
      if (kosh) params.kosher_type = kosh;
      if (time > 0) params.max_prep_time = time;
      if (cat) params.category = cat;
      const { data } = await searchApi.search(params);
      setResults(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "";
    setQuery(q);
    setActiveCategory(cat);
    if (q.length >= 2 || cat) doSearch(q, "", "", 0, cat);
  }, [searchParams, doSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 || difficulty || kosherType || maxPrepTime > 0 || activeCategory) {
        doSearch(query, difficulty, kosherType, maxPrepTime, activeCategory);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, difficulty, kosherType, maxPrepTime, activeCategory, doSearch]);

  const hasActiveFilters = Boolean(difficulty || kosherType || maxPrepTime > 0);
  const activeFilterCount = [activeCategory, difficulty, kosherType, maxPrepTime > 0].filter(Boolean).length;
  const clearFilters = () => {
    setDifficulty("");
    setKosherType("");
    setMaxPrepTime(0);
  };
  const clearAll = () => {
    setQuery("");
    setActiveCategory("");
    clearFilters();
    setResults([]);
    setSearched(false);
  };
  const runQuickSearch = (q: string) => {
    setIngredientMode(false);
    setQuery(q);
    setActiveCategory("");
    doSearch(q, difficulty, kosherType, maxPrepTime, "");
  };
  const addIngredientTag = (raw = ingredientInput) => {
    const t = raw.trim();
    if (t) setIngredientTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setIngredientInput("");
  };
  const removeIngredientTag = (tag: string) => setIngredientTags(ingredientTags.filter((t) => t !== tag));

  const searchByIngredients = async () => {
    if (ingredientTags.length === 0) return;
    setSuggestLoading(true);
    setSuggestions(null);
    setAiSuggestions(null);
    try {
      const { data } = await suggestApi.fromIngredients(ingredientTags);
      setSuggestions(data);
    } catch {}
    try {
      const { data } = await suggestApi.aiGenerate(ingredientTags);
      setAiSuggestions(data.suggestions);
    } catch {}
    setSuggestLoading(false);
  };

  return (
    <PageFrame tone="forest" className="search-experience">
      <div className="max-w-5xl mx-auto">
      <header className="experience-hero experience-hero--search mb-7 animate-fade-up">
        <span className="eyebrow mb-3">
          <span className="plus-badge text-bark-500">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
          </span>
          האוסף
        </span>
        <h1 className="display-lg text-bark-500">
          {initialQ ? `«${initialQ}»` : "כל המתכונים"}
        </h1>
        <p className="text-bark-300 text-sm sm:text-base mt-3 max-w-xl">
          חפשו לפי שם מתכון, מצרך, קטגוריה או מה שיש בבית.
        </p>
      </header>

      <div className="flex items-center gap-2 mb-5 animate-fade-up" style={{ animationDelay: "50ms" }}>
        <button
          type="button"
          onClick={() => {
            setIngredientMode(false);
            setSuggestions(null);
            setAiSuggestions(null);
          }}
          className={cn(
            "search-choice px-4 py-2.5 text-sm font-semibold transition-colors",
            !ingredientMode
              ? "is-selected"
              : ""
          )}
        >
          <Search className="w-4 h-4 inline-block ml-1.5" />
          חיפוש רגיל
        </button>
        <button
          type="button"
          onClick={() => setIngredientMode(true)}
          className={cn(
            "search-choice px-4 py-2.5 text-sm font-semibold transition-colors",
            ingredientMode
              ? "is-selected"
              : ""
          )}
        >
          <Sparkles className="w-4 h-4 inline-block ml-1.5" />
          מה אפשר להכין?
        </button>
      </div>

      {!ingredientMode && (
        <div className="relative search-composer mb-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-200" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="חיפוש מתכון"
            placeholder="חפשו מתכון לפי שם או תיאור..."
            className={cn("input-dark pr-8", query ? "pl-24" : "pl-12")}
            style={{ fontSize: 22, paddingBottom: 12 }}
            autoFocus={!initialQ}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
              }}
              className="absolute left-10 top-1/2 -translate-y-1/2 p-2 text-bark-200 hover:text-cinnamon-500 transition-colors"
              aria-label="ניקוי החיפוש"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 p-2 transition-colors",
              hasActiveFilters || showFilters ? "text-cinnamon-500" : "text-bark-200 hover:text-bark-500"
            )}
            aria-label="סינון"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      )}

      {!ingredientMode && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat.name ? "" : cat.name)}
              className={cn(
                "search-choice px-3.5 py-1.5 text-xs font-bold transition-colors",
                activeCategory === cat.name
                  ? "is-selected"
                  : ""
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {!ingredientMode && !query && !activeCategory && (
        <div className="flex flex-wrap items-center gap-2 mb-7 animate-fade-up" style={{ animationDelay: "140ms" }}>
          <span className="text-xs font-bold text-bark-200">חיפושים מהירים</span>
          {QUICK_SEARCHES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => runQuickSearch(q)}
              className="search-choice px-3 py-1.5 text-xs font-bold transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {!ingredientMode && (activeFilterCount > 0 || query) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 animate-fade-up">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-bark-300">
            {query && <span className="badge badge-neutral">חיפוש: {query}</span>}
            {activeCategory && <span className="badge badge-neutral">{activeCategory}</span>}
            {difficulty && <span className="badge badge-neutral">{DIFFICULTY_FILTERS.find((f) => f.value === difficulty)?.label}</span>}
            {kosherType && <span className="badge badge-neutral">{KOSHER_FILTERS.find((f) => f.value === kosherType)?.label}</span>}
            {maxPrepTime > 0 && <span className="badge badge-neutral">עד {maxPrepTime} דק׳</span>}
          </div>
          <button type="button" onClick={clearAll} className="text-xs font-bold text-cinnamon-500 hover:text-cinnamon-600">
            איפוס חיפוש
          </button>
        </div>
      )}

      {ingredientMode && (
        <div className="card-surface search-pantry p-6 mb-6 animate-fade-up">
          <p className="text-sm text-bark-300 mb-4">כתבו מה יש בבית, ונמצא מתכונים שמתאימים למצרכים שלכם.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_INGREDIENTS.map((ingredient) => (
              <button
                key={ingredient}
                type="button"
                onClick={() => addIngredientTag(ingredient)}
                className="search-choice px-3 py-1.5 text-xs font-bold transition-colors"
              >
                {ingredient}
              </button>
            ))}
          </div>
          <form
            className="flex items-end gap-2 mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              addIngredientTag();
            }}
          >
            <input
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              placeholder="למשל: עוף, אורז, בצל..."
              className="input-dark flex-1"
            />
            <button type="submit" disabled={!ingredientInput.trim()} className="btn-fire h-11 min-h-0 px-4 disabled:opacity-30">
              <Plus className="w-4 h-4" />
              <span className="mr-1.5 text-sm">הוספה</span>
            </button>
          </form>
          {ingredientTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredientTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cinnamon-50 border border-cinnamon-200 text-cinnamon-700 text-sm font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => removeIngredientTag(tag)} className="hover:text-red-500" aria-label={`הסרת ${tag}`}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={searchByIngredients}
            disabled={ingredientTags.length === 0 || suggestLoading}
            className="btn-block disabled:opacity-40"
          >
            {suggestLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
            מצאו מתכונים
          </button>

          {aiSuggestions && aiSuggestions.length > 0 && (
            <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(39,94,80,0.12)" }}>
              <p className="eyebrow mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                הצעות
              </p>
              <div className="space-y-3">
                {aiSuggestions.map((s: any, i: number) => (
                  <div key={i} className="p-4 bg-surface-100" style={{ border: "1px solid rgba(39,94,80,0.12)" }}>
                    <h4 className="font-bold text-bark-500 mb-1">{s.title}</h4>
                    <p className="text-sm text-bark-300 mb-2">{s.description}</p>
                    <div className="flex gap-2 text-xs text-bark-300">
                      <span className="badge badge-neutral">
                        {s.difficulty === "easy" ? "קל" : s.difficulty === "medium" ? "בינוני" : "מאתגר"}
                      </span>
                      {s.prep_time_minutes && <span className="badge badge-neutral">{s.prep_time_minutes} דק׳</span>}
                    </div>
                    {s.extra_ingredients?.length > 0 && (
                      <p className="text-xs text-bark-200 mt-2">צריך גם: {s.extra_ingredients.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!ingredientMode && showFilters && (
        <div className="card-surface filter-drawer p-5 mb-6 space-y-5 animate-fade-up">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-bark-500">סינון</h3>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="text-xs font-bold text-cinnamon-500 hover:text-cinnamon-600">
                נקה הכל
              </button>
            )}
          </div>
          <FilterRow label="רמת קושי" options={DIFFICULTY_FILTERS} value={difficulty} onChange={setDifficulty} />
          <FilterRow label="סוג כשרות" options={KOSHER_FILTERS} value={kosherType} onChange={setKosherType} />
          <FilterRow
            label="זמן הכנה"
            options={TIME_FILTERS.map((f) => ({ value: String(f.value), label: f.label }))}
            value={String(maxPrepTime)}
            onChange={(v) => setMaxPrepTime(Number(v))}
          />
        </div>
      )}

      {ingredientMode ? (
        suggestions && suggestions.length > 0 ? (
          <div>
            <p className="eyebrow mb-4">מהקהילה</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {suggestions.map((r: any) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </div>
        ) : suggestions !== null ? (
          <EmptyState title="לא נמצאו מתכונים מהמצרכים האלה" />
        ) : null
      ) : loading ? (
        <RecipeLoading label="מוצאת לך רעיונות" kind="search" />
      ) : results.length > 0 ? (
        <div>
          <p className="text-sm text-bark-200 mb-5">{results.length} מתכונים</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {results.map((r, i) => (
              <div key={r.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        </div>
      ) : searched ? (
        <EmptyState title="לא נמצאו מתכונים" onReset={clearAll} />
      ) : (
        <EmptyState title="בחרו קטגוריה או חיפוש מהיר" action={false} />
      )}
      </div>
    </PageFrame>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="input-label mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={cn(
              "search-choice px-3.5 py-1.5 text-xs font-bold transition-colors",
              value === f.value
                ? "is-selected"
                : ""
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  action = true,
  onReset,
}: {
  title: string;
  action?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className="card-surface p-8 sm:p-10 text-center animate-fade-up">
      <p className="section-title text-bark-500 mb-2">{title}</p>
      <p className="text-bark-300 text-sm mb-6">נסו מילה אחרת, מצרך אחר או קטגוריה קרובה.</p>
      {onReset ? (
        <button type="button" onClick={onReset} className="btn-outline inline-flex">
          איפוס חיפוש
        </button>
      ) : action && (
        <Link href="/#categories" className="btn-outline inline-flex">
          לכל הקטגוריות
        </Link>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PageFrame tone="forest" className="search-experience">
          <RecipeLoading label="מכינה את החיפוש" kind="search" compact />
        </PageFrame>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
