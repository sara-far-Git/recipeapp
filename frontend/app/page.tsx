"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { recipesApi, searchApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import { Loader2, ChefHat, SlidersHorizontal, X, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const DIFFICULTY_OPTS = [{ v: "", l: "כל הרמות" }, { v: "easy", l: "קל" }, { v: "medium", l: "בינוני" }, { v: "hard", l: "מאתגר" }];
const KOSHER_OPTS = [{ v: "", l: "כל הסוגים" }, { v: "meat", l: "בשרי" }, { v: "dairy", l: "חלבי" }, { v: "pareve", l: "פרווה" }];
const TIME_OPTS = [{ v: 0, l: "כל הזמנים" }, { v: 15, l: "עד 15 דק'" }, { v: 30, l: "עד 30 דק'" }, { v: 60, l: "עד שעה" }];

const CATEGORIES = [
  { name: "ראשונות", desc: "מנות פתיחה שפותחות את הארוחה" },
  { name: "עיקריות", desc: "ארוחה מלאה על צלחת אחת" },
  { name: "מאפים",   desc: "לחמים, בצקים וכל מה שבתנור" },
  { name: "קינוחים", desc: "הסוף המתוק, בלי להתנצל" },
  { name: "סלטים",   desc: "ירק, טרי, ובעיקר מהיר" },
  { name: "משקאות",  desc: "חמים, קרים, ומשהו באמצע" },
];

const REASONS = [
  { t: "בגלל האוסף",        d: "כל המתכונים במקום אחד, מסודרים לפי קטגוריה, רמת קושי וזמן הכנה." },
  { t: "בגלל הסינון",       d: "כשרות, קושי וזמן — מסננים עד שנשאר בדיוק מה שמתאים להיום." },
  { t: "בגלל רשימת הקניות", d: "כל מה שצריך לקנות נאסף לרשימה אחת מהמתכונים שבחרתם." },
  { t: "בגלל הקהילה",       d: "לייקים, דירוגים ותגובות — ככה יודעים מה באמת עובד במטבח." },
  { t: "בגלל הסימניות",     d: "שומרים מתכון בלחיצה אחת, וחוזרים אליו מכל מכשיר." },
  { t: "בגלל שזה על המסך",  d: "מתקינים כאפליקציה ופותחים אותה כמו כל אפליקציה אחרת." },
];

export default function FeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [kosher, setKosher] = useState("");
  const [maxTime, setMaxTime] = useState(0);

  const filtersActive = Boolean(difficulty || kosher || maxTime > 0);

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

  const handleCategoryClick = (name: string) => {
    router.push(`/category/${encodeURIComponent(name)}`);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loadingMore) {
          setLoadingMore(true); loadRecipes(recipes.length);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, recipes.length, loadRecipes]);

  const editorPick = filtersActive ? null : recipes[0];
  const gridRecipes = filtersActive ? recipes : recipes.slice(1);

  const sections = [
    { id: "hero", label: "ברוכים הבאים", dark: false },
    { id: "categories", label: "קטגוריות", dark: true },
    { id: "recipes", label: "האוסף", dark: false },
    ...(editorPick ? [{ id: "weekly", label: "המתכון של השבוע", dark: true }] : []),
    { id: "why", label: "למה כאן", dark: false },
    { id: "join", label: "להצטרף", dark: true },
  ];

  return (
    <div>
      <SectionRail sections={sections} />

      <div className="full-bleed stack-root -mt-6">
      <CinematicSection id="hero" tone="cream" layer={1}>
        <div className="bleed-inner grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center py-10">
          <div className="order-2 lg:order-1">
            <Reveal>
              <h1 className="display-hero text-bark-500">
                {user ? (
                  <>שלום,<br /><span className="text-cinnamon-500">{user.full_name || user.username}</span></>
                ) : (
                  <>המטבח<br />של הבית</>
                )}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <div className="flex items-center gap-3 mt-6">
                <span className="plus-badge text-bark-500"><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
              </div>
              <p className="text-bark-400 mt-4 text-lg sm:text-xl font-medium max-w-sm leading-snug">
                {user ? "מה מתבשל אצלכם היום?" : "מתכונים שעוברים במשפחה, עם רשימת קניות שנבנית לבד"}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <Link href={user ? "/recipe/new" : "/register"} className="btn-block mt-8 inline-flex">
                {user ? "מתכון חדש" : "הצטרפו בחינם"}
              </Link>
            </Reveal>
          </div>

          <Reveal delay={80} className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[520px]">
              <KitchenCollage />
              <Seal />
            </div>
          </Reveal>
        </div>
      </CinematicSection>

      <CinematicSection id="categories" tone="bark" layer={2}>
        <div className="bleed-inner py-16">
          <Reveal>
            <h2 className="display-lg" style={{ color: "#f7f1e4" }}>מה תרצו<br />להכין היום?</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex items-center gap-3 mt-5 mb-10">
              <span className="plus-badge" style={{ color: "#f7f1e4" }}><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
              <p className="text-lg" style={{ color: "#d4c8b6" }}>בחרו סוג, ומיד מגיעים למתכונים</p>
            </div>
          </Reveal>

          <div className="border-t" style={{ borderColor: "rgba(247,241,228,0.18)" }}>
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.name} delay={80 + i * 70}>
                <button onClick={() => handleCategoryClick(cat.name)}
                  className="row-wipe group w-full text-right py-6 flex items-center gap-5 sm:gap-8 text-surface-100 hover:text-bark-500 transition-colors duration-500"
                  style={{ borderBottom: "1px solid rgba(247,241,228,0.18)" }}>
                  <span className="tabular text-sm w-8 text-surface-400 group-hover:text-bark-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-2xl sm:text-4xl font-extrabold" style={{ letterSpacing: "-0.03em" }}>
                    {cat.name}
                  </span>
                  <span className="hidden sm:block flex-1 text-[15px] text-smoke-200 group-hover:text-bark-300">
                    {cat.desc}
                  </span>
                  <span className="plus-badge mr-auto group-hover:border-bark-500">
                    <Plus className="w-4 h-4" strokeWidth={2.4} />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </CinematicSection>

      <CinematicSection id="recipes" tone="cream" layer={3}>
        <div className="bleed-inner h-full overflow-y-auto py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Reveal>
              <div>
                <h2 className="display-lg text-bark-500">מתכונים<br />נבחרים</h2>
                <div className="flex items-center gap-3 mt-5">
                  <span className="plus-badge text-bark-500"><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
                  <p className="text-bark-300 text-lg">האוסף שנאסף באהבה</p>
                </div>
              </div>
            </Reveal>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-5 h-12 text-sm font-bold border transition-all",
                  showFilters || filtersActive
                    ? "bg-bark-500 border-bark-500 text-surface-100"
                    : "bg-transparent border-bark-500 text-bark-500",
                )}
                style={{ borderRadius: 2 }}>
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.8} />
                סינון
                {filtersActive && (
                  <span className="w-5 h-5 bg-cinnamon-500 text-surface-100 text-xs flex items-center justify-center">
                    {[difficulty, kosher, maxTime > 0].filter(Boolean).length}
                  </span>
                )}
              </button>
              {filtersActive && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm font-bold text-bark-200 hover:text-cinnamon-500">
                  <X className="w-4 h-4" />נקה
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="card-surface mt-8 p-6 space-y-5">
              <FilterRow label="רמת קושי" opts={DIFFICULTY_OPTS} active={difficulty} onSelect={setDifficulty} />
              <FilterRow label="כשרות" opts={KOSHER_OPTS} active={kosher} onSelect={setKosher} />
              <FilterRow label="זמן הכנה" opts={TIME_OPTS} active={String(maxTime)} onSelect={(v) => setMaxTime(Number(v))} />
            </div>
          )}

          <div className="mt-14">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-cinnamon-500" />
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-20">
                <ChefHat className="w-12 h-12 mx-auto text-bark-50 mb-6" strokeWidth={1.2} />
                <h3 className="display-md text-bark-500 mb-3">
                  {filtersActive ? "אין מתכונים שמתאימים לסינון" : "עדיין אין מתכונים"}
                </h3>
                <p className="text-bark-100 mb-9 text-[15px]">
                  {filtersActive ? "נסו לשחרר אחד מהמסננים." : "היו הראשונים לשתף מתכון עם הקהילה."}
                </p>
                {filtersActive ? (
                  <button onClick={clearFilters} className="btn-block">נקו את הסינון</button>
                ) : user ? (
                  <Link href="/recipe/new" className="btn-block">יצירת מתכון ראשון</Link>
                ) : null}
              </div>
            ) : gridRecipes.length === 0 ? (
              <p className="text-center py-10 text-bark-100 text-[15px]">
                זה כל האוסף כרגע — המתכון היחיד מחכה לכם למטה.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {gridRecipes.map((recipe, i) => (
                  <Reveal key={recipe.id} delay={(i % 3) * 90}>
                    <RecipeCard recipe={recipe} />
                  </Reveal>
                ))}
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-cinnamon-500" />
              </div>
            )}
          </div>
        </div>
      </CinematicSection>

      {editorPick && (
        <CinematicSection id="weekly" tone="bark" layer={4}>
          <div className="bleed-inner grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center py-16">
            <Reveal>
              <Link href={`/recipe/${editorPick.id}`} className="relative block group overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    background: editorPick.image_url
                      ? `url(${editorPick.image_url}) center/cover`
                      : "linear-gradient(150deg, #c89668 0%, #a06f3f 50%, #6b4423 100%)",
                  }} />
                {!editorPick.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChefHat className="w-24 h-24 text-surface-100/70" strokeWidth={0.9} />
                  </div>
                )}
                <span className="absolute top-5 right-5 px-3 py-1 text-xs font-bold"
                  style={{ background: "#8b3a1f", color: "#f7f1e4" }}>
                  {new Date().toLocaleDateString("he-IL", { weekday: "long" })}
                </span>
              </Link>
            </Reveal>

            <Reveal delay={140}>
              <div>
                <h2 className="display-lg" style={{ color: "#f7f1e4" }}>
                  המתכון
                  <br />
                  של <span style={{ color: "#c47a52" }}>השבוע</span>
                </h2>
                <p className="mt-8 text-xl font-extrabold" style={{ color: "#f7f1e4" }}>
                  {editorPick.title}
                </p>
                {editorPick.description && (
                  <p className="mt-4 text-base leading-relaxed line-clamp-4" style={{ color: "#d4c8b6" }}>
                    {editorPick.description}
                  </p>
                )}
                <Link href={`/recipe/${editorPick.id}`} className="btn-block mt-8"
                  style={{ background: "transparent", border: "1.5px solid #c47a52", color: "#f7f1e4" }}>
                  למתכון המלא ←
                </Link>
              </div>
            </Reveal>
          </div>
        </CinematicSection>
      )}

      <CinematicSection id="why" tone="cream" layer={5}>
        <div className="bleed-inner py-16">
          <Reveal>
            <h2 className="display-lg text-bark-500">למה לבשל<br />מכאן</h2>
            <div className="flex items-center gap-3 mt-5 mb-14">
              <span className="plus-badge text-bark-500"><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
              <p className="text-bark-300 text-lg">ספר מתכונים שבאמת משתמשים בו</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
            {REASONS.map((r, i) => (
              <Reveal key={r.t} delay={(i % 3) * 90}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="plus-badge text-bark-500" style={{ width: 28, height: 28 }}>
                      <Plus className="w-3 h-3" strokeWidth={2.5} />
                    </span>
                    <span className="tabular text-xs font-bold text-cinnamon-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-bark-500 text-xl font-extrabold mb-3">{r.t}</h3>
                  <p className="text-bark-300 text-[15px] leading-relaxed">{r.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </CinematicSection>

      <CinematicSection id="join" tone="bark" layer={6}>
        <div className="bleed-inner py-16 text-center">
          <Reveal>
            <h2 className="display-hero" style={{ color: "#f7f1e4" }}>
              יש לכם
              <br />
              מתכון?
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="plus-badge" style={{ color: "#f7f1e4" }}><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
            </div>
            <p className="text-xl mt-4" style={{ color: "#d4c8b6" }}>זה שכולם מבקשים — הזמן לכתוב אותו כאן.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link href={user ? "/recipe/new" : "/register"} className="btn-block"
                style={{ background: "#efe7d7", color: "#3a2618" }}>
                {user ? "כתיבת מתכון" : "פתיחת חשבון"}
              </Link>
              {!user && (
                <Link href="/login" className="font-bold hover:text-cinnamon-200" style={{ color: "#d9c79a" }}>
                  כבר יש לי חשבון
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </CinematicSection>
      </div>

      <JoinBar user={user} />
    </div>
  );
}

function CinematicSection({
  id, tone, children, layer = 1, className,
}: {
  id: string;
  tone: "cream" | "bark";
  children: React.ReactNode;
  layer?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
      setInView(true);
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.16 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "stack-panel",
        tone === "bark" ? "panel-bark" : "panel-cream",
        inView && "in-view",
        className,
      )}
      style={{ ["--stack-z" as string]: layer }}>
      <div className="cinematic-slabs" aria-hidden="true">
        <span className="slab slab-a" />
        <span className="slab slab-b slab-left slab-delay-1" />
        <span className="slab slab-c slab-left slab-delay-2" />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col justify-center">{children}</div>
    </section>
  );
}

function Reveal({
  children, delay = 0, className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", shown && "is-shown", className)}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}>
      {children}
    </div>
  );
}

function JoinBar({ user }: { user: { username?: string } | null }) {
  const [hidden, setHidden] = useState(false);
  const [atJoin, setAtJoin] = useState(false);

  useEffect(() => {
    const el = document.getElementById("join");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAtJoin(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (hidden || atJoin) return null;

  return (
    <div className="hidden md:flex fixed bottom-0 inset-x-0 z-40 items-center justify-between gap-6 px-8 py-4"
      style={{ background: "#efe7d7", borderTop: "1px solid #3a2618" }}>
      <p className="text-bark-500 font-extrabold text-lg">רוצים לשמור מתכונים ורשימת קניות במקום אחד?</p>
      <div className="flex items-center gap-4">
        <Link href={user ? "/recipe/new" : "/register"} className="btn-block">
          {user ? "מתכון חדש" : "הצטרפו בחינם"}
        </Link>
        <button onClick={() => setHidden(true)} className="text-bark-200 hover:text-bark-500" aria-label="סגירה">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/** Bold kitchen collage — black ink on cream, Siur's graphic weight. */
function KitchenCollage() {
  return (
    <svg viewBox="0 0 520 480" className="w-full h-auto animate-float" fill="#3a2618" aria-hidden="true">
      {/* pot */}
      <path d="M118 230h250c12 0 22 10 22 22v118c0 28-22 50-50 50H146c-28 0-50-22-50-50V252c0-12 10-22 22-22z" />
      <path d="M108 230h270v18H108z" />
      <path d="M368 268h46c18 0 32 14 32 32s-14 32-32 32h-46" fill="none" stroke="#3a2618" strokeWidth="18" />
      {/* lid */}
      <ellipse cx="243" cy="214" rx="118" ry="22" />
      <rect x="230" y="176" width="26" height="28" rx="8" />
      <circle cx="243" cy="168" r="14" />
      {/* steam */}
      <path d="M190 150c0-22 18-28 18-48" fill="none" stroke="#3a2618" strokeWidth="10" strokeLinecap="round" />
      <path d="M230 140c0-26 20-32 20-54" fill="none" stroke="#3a2618" strokeWidth="10" strokeLinecap="round" />
      <path d="M270 150c0-22 16-28 16-46" fill="none" stroke="#3a2618" strokeWidth="10" strokeLinecap="round" />
      {/* open book */}
      <path d="M40 86c38-18 78-10 110 8v150c-36-22-78-28-110-8V86z" />
      <path d="M480 86c-38-18-78-10-110 8v150c36-22 78-28 110-8V86z" />
      <path d="M150 96c0 40-8 70-8 118" fill="none" stroke="#efe7d7" strokeWidth="4" />
      <path d="M370 96c0 40 8 70 8 118" fill="none" stroke="#efe7d7" strokeWidth="4" />
      {/* spoon */}
      <ellipse cx="430" cy="300" rx="28" ry="40" transform="rotate(28 430 300)" />
      <rect x="442" y="330" width="16" height="110" rx="8" transform="rotate(28 450 385)" />
    </svg>
  );
}

function Seal() {
  const spikes = 22;
  const points = Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 96 : 84;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    return `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

  return (
    <div className="absolute bottom-4 left-2 sm:left-6 w-[96px] h-[96px] sm:w-[112px] sm:h-[112px]">
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow" aria-hidden="true">
        <polygon points={points} fill="#8b3a1f" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none text-center">
        <span className="text-surface-100 text-[12px] sm:text-[14px] font-extrabold">מהמטבח</span>
        <span className="text-surface-100 text-[12px] sm:text-[14px] font-extrabold">אליכם</span>
      </div>
    </div>
  );
}

function SectionRail({ sections }: { sections: { id: string; label: string; dark: boolean }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections.map((s) => s.id).join()]);

  const current = sections.find((s) => s.id === active);
  const onDark = current?.dark ?? false;

  return (
    <nav
      className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center py-6 px-3"
      style={{
        background: onDark ? "rgba(58,38,24,0.55)" : "rgba(239,231,215,0.72)",
        borderInlineStart: `1px solid ${onDark ? "rgba(247,241,228,0.15)" : "rgba(58,38,24,0.12)"}`,
      }}
      aria-label="ניווט בין חלקי הדף">
      {sections.map((s, i) => {
        const isActive = active === s.id;
        return (
          <a key={s.id} href={`#${s.id}`}
            className="py-1.5"
            aria-current={isActive ? "true" : undefined}>
            <span className={cn("tabular text-[12px] font-extrabold transition-colors",
              isActive
                ? onDark ? "text-cinnamon-200" : "text-cinnamon-500"
                : onDark ? "text-smoke-200" : "text-bark-50")}>
              {String(i + 1).padStart(2, "0")}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

function FilterRow({ label, opts, active, onSelect }: { label: string; opts: { v: string | number; l: string }[]; active: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-bold text-bark-100 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={o.v} onClick={() => onSelect(String(o.v))}
            className={cn("px-4 py-2 text-[13px] font-bold border transition-all",
              String(active) === String(o.v)
                ? "bg-cinnamon-500 border-cinnamon-500 text-surface-100"
                : "bg-transparent border-surface-500 text-bark-300 hover:border-bark-500 hover:text-bark-500",
            )}
            style={{ borderRadius: 2 }}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}
