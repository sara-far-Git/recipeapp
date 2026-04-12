"use client";

import { useState, useEffect, useCallback } from "react";
import { searchApi, suggestApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import Button from "@/components/ui/Button";
import { Search, SlidersHorizontal, X, Loader2, Sparkles, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
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

  const doSearch = useCallback(async () => {
    setLoading(true); setSearched(true);
    try {
      const params: any = {};
      if (query) params.q = query;
      if (difficulty) params.difficulty = difficulty;
      if (kosherType) params.kosher_type = kosherType;
      if (maxPrepTime > 0) params.max_prep_time = maxPrepTime;
      const { data } = await searchApi.search(params);
      setResults(data);
    } catch {}
    setLoading(false);
  }, [query, difficulty, kosherType, maxPrepTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 || difficulty || kosherType || maxPrepTime > 0) doSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [query, difficulty, kosherType, maxPrepTime, doSearch]);

  const hasActiveFilters = difficulty || kosherType || maxPrepTime > 0;
  const clearFilters = () => { setDifficulty(""); setKosherType(""); setMaxPrepTime(0); };
  const addIngredientTag = () => { const t = ingredientInput.trim(); if (t && !ingredientTags.includes(t)) setIngredientTags([...ingredientTags, t]); setIngredientInput(""); };
  const removeIngredientTag = (tag: string) => setIngredientTags(ingredientTags.filter((t) => t !== tag));

  const searchByIngredients = async () => {
    if (ingredientTags.length === 0) return;
    setSuggestLoading(true); setSuggestions(null); setAiSuggestions(null);
    try { const { data } = await suggestApi.fromIngredients(ingredientTags); setSuggestions(data); } catch {}
    try { const { data } = await suggestApi.aiGenerate(ingredientTags); setAiSuggestions(data.suggestions); } catch {}
    setSuggestLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-100 mb-6 animate-fade-up">חיפוש מתכונים</h1>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-5 animate-fade-up" style={{ animationDelay: "50ms" }}>
        <button
          onClick={() => { setIngredientMode(false); setSuggestions(null); setAiSuggestions(null); }}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2",
            !ingredientMode ? "btn-fire text-white" : "bg-white/[0.05] text-smoke-300 border border-white/[0.07] hover:bg-white/[0.08]"
          )}
        >
          <Search className="w-4 h-4" /> חיפוש רגיל
        </button>
        <button
          onClick={() => setIngredientMode(true)}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2",
            ingredientMode ? "btn-fire text-white" : "bg-white/[0.05] text-smoke-300 border border-white/[0.07] hover:bg-white/[0.08]"
          )}
        >
          <Sparkles className="w-4 h-4" /> מה אפשר לבשל?
        </button>
      </div>

      {/* Search bar */}
      {!ingredientMode && (
        <div className="relative mb-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפשו מתכון לפי שם או תיאור..."
            className="input-dark pr-12 pl-12"
            autoFocus
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300",
              hasActiveFilters || showFilters ? "text-fire-300 bg-fire-400/10" : "text-gray-600 hover:text-gray-400"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Ingredient mode */}
      {ingredientMode && (
        <div className="card-surface p-5 mb-6 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <p className="text-sm text-gray-400 mb-4">הקלידו מצרכים שיש לכם בבית ונמצא מתכונים מתאימים</p>
          <div className="flex gap-2 mb-3">
            <input value={ingredientInput} onChange={(e) => setIngredientInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addIngredientTag()} placeholder="למשל: עוף, אורז, בצל..." className="input-dark flex-1" />
            <Button onClick={addIngredientTag} disabled={!ingredientInput.trim()}>הוסף</Button>
          </div>
          {ingredientTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredientTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-fire-500/15 border border-fire-500/20 text-fire-200 text-sm font-medium">
                  {tag}
                  <button onClick={() => removeIngredientTag(tag)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
          <Button onClick={searchByIngredients} loading={suggestLoading} disabled={ingredientTags.length === 0}>
            <ChefHat className="w-4 h-4" /> מצא מתכונים
          </Button>

          {aiSuggestions && aiSuggestions.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-300">
                <Sparkles className="w-4 h-4 text-fire-300" /> הצעות AI
              </h3>
              <div className="space-y-3">
                {aiSuggestions.map((s: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-surface-300/50 border border-fire-500/10 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <h4 className="font-bold text-gray-200 mb-1">{s.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{s.description}</p>
                    <div className="flex gap-2 text-xs text-gray-600">
                      <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] font-medium">
                        {s.difficulty === "easy" ? "קל" : s.difficulty === "medium" ? "בינוני" : "מאתגר"}
                      </span>
                      {s.prep_time_minutes && <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] font-medium">{s.prep_time_minutes} דק׳</span>}
                    </div>
                    {s.extra_ingredients?.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2">צריך גם: {s.extra_ingredients.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {!ingredientMode && showFilters && (
        <div className="card-surface p-5 mb-6 space-y-5 animate-slide-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-300">סינון תוצאות</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-fire-300 font-medium flex items-center gap-1 hover:text-fire-200">
                <X className="w-3 h-3" /> נקה הכל
              </button>
            )}
          </div>
          <FilterRow label="רמת קושי" options={DIFFICULTY_FILTERS} value={difficulty} onChange={setDifficulty} />
          <FilterRow label="סוג כשרות" options={KOSHER_FILTERS} value={kosherType} onChange={setKosherType} />
          <FilterRow label="זמן הכנה" options={TIME_FILTERS.map(f => ({ value: String(f.value), label: f.label }))} value={String(maxPrepTime)} onChange={(v) => setMaxPrepTime(Number(v))} />
        </div>
      )}

      {/* Results */}
      {ingredientMode ? (
        suggestions && suggestions.length > 0 ? (
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-300">מתכונים מהקהילה:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {suggestions.map((r: any) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </div>
        ) : suggestions !== null ? <EmptyState /> : null
      ) : loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-fire-400" /></div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((r, i) => (
            <div key={r.id} className="animate-slide-up opacity-0" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}>
              <RecipeCard recipe={r} />
            </div>
          ))}
        </div>
      ) : searched ? <EmptyState /> : (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 border border-white/[0.06] flex items-center justify-center">
            <Search className="w-7 h-7 text-gray-700" />
          </div>
          <p className="text-gray-600 font-medium">הקלידו לפחות 2 תווים לחיפוש</p>
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((f) => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300",
              value === f.value ? "btn-fire text-white" : "bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:bg-white/[0.08] hover:text-gray-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 animate-fade-up">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 border border-white/[0.06] flex items-center justify-center">
        <ChefHat className="w-7 h-7 text-gray-700" />
      </div>
      <p className="text-gray-600 font-medium">לא נמצאו מתכונים</p>
    </div>
  );
}
