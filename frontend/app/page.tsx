"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { recipesApi, searchApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import RecipeLoading from "@/components/ui/RecipeLoading";
import { ArrowUp, LoaderCircle, SlidersHorizontal, X, Plus, Search } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Mark from "@/components/ui/Mark";
import WritingCard from "@/components/home/WritingCard";
import { CATEGORIES } from "@/lib/categories";

const DIFFICULTY_OPTS = [{ v: "", l: "כל הרמות" }, { v: "easy", l: "קל" }, { v: "medium", l: "בינוני" }, { v: "hard", l: "מאתגר" }];
const KOSHER_OPTS = [{ v: "", l: "כל הסוגים" }, { v: "meat", l: "בשרי" }, { v: "dairy", l: "חלבי" }, { v: "pareve", l: "פרווה" }];
const TIME_OPTS = [{ v: 0, l: "כל הזמנים" }, { v: 15, l: "עד 15 דק'" }, { v: 30, l: "עד 30 דק'" }, { v: 60, l: "עד שעה" }];
const QUICK_STARTS = ["יש לי עוף וירקות", "ארוחה ב-20 דקות", "משהו מתוק לשבת", "ארוחה צמחונית"];

const REASONS = [
  { t: "כל המתכונים במקום אחד", d: "בלי צילומי מסך, פתקים והודעות שנעלמות בדיוק כשצריך אותן." },
  { t: "חיפוש שמגיע מהר", d: "שם, קטגוריה, זמן, רמת קושי או מצרך — ומוצאים מה מתאים להיום." },
  { t: "רשימת קניות מתוך מתכון", d: "בוחרים מה חסר, מוסיפים לרשימה, ויוצאים לקנות מסודר." },
  { t: "מצב הכנה נוח", d: "המצרכים והשלבים נשארים ברורים בזמן הבישול, גם על מסך קטן." },
  { t: "הספר הולך איתכם", d: "שומרים מתכון פעם אחת וחוזרים אליו מהטלפון או מהמחשב." },
  { t: "קהילה שמבשלת באמת", d: "דירוגים, תגובות ורעיונות מאנשים שניסו, תיקנו וחזרו להכין." },
];

export default function FeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [kosher, setKosher] = useState("");
  const [maxTime, setMaxTime] = useState(0);
  const [heroQuery, setHeroQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeQuickStart, setActiveQuickStart] = useState<string | null>(null);
  const [composerAttention, setComposerAttention] = useState(false);
  const composerRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
  }, []);

  const filtersActive = Boolean(difficulty || kosher || maxTime > 0);

  const loadRecipes = useCallback(async (diff = difficulty, kosh = kosher, time = maxTime) => {
    try {
      const res = (diff || kosh || time)
        ? await searchApi.search({ difficulty: diff || undefined, kosher_type: kosh || undefined, max_prep_time: time || undefined, skip: 0, limit: 4 })
        : await recipesApi.list(0, 4);
      setRecipes(res.data);
    } catch {} finally { setLoading(false); }
  }, [difficulty, kosher, maxTime]);

  useEffect(() => { setLoading(true); loadRecipes(difficulty, kosher, maxTime); }, [difficulty, kosher, maxTime, loadRecipes]);

  const clearFilters = () => { setDifficulty(""); setKosher(""); setMaxTime(0); };

  const handleCategoryClick = (name: string) => {
    router.push(`/category/${encodeURIComponent(name)}`);
  };

  const submitHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroQuery.trim();
    if (!q) {
      setComposerAttention(true);
      window.setTimeout(() => setComposerAttention(false), 480);
      composerRef.current?.focus();
      return;
    }
    setIsSearching(true);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const startWithPrompt = (prompt: string) => {
    setHeroQuery(prompt);
    setActiveQuickStart(prompt);
    window.setTimeout(() => setActiveQuickStart(null), 720);
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  const editorPick = filtersActive ? null : recipes[0];
  const gridRecipes = (filtersActive ? recipes : recipes.slice(1)).slice(0, 3);

  const stackCount = editorPick ? 6 : 5;

  return (
    <div className="home-page">
      <HomeStack count={stackCount}>
      <CinematicSection id="hero" tone="bark" index={0} className="home-panel-hero">
        <div className="bleed-inner assistant-home">
          <Reveal className="assistant-welcome">
            <h1 className="display-hero assistant-title" style={{ color: "#FAF8F3" }}>
              {user ? <>מה בא לך<br />לבשל היום?</> : <>מה נכין<br />היום?</>}
            </h1>
            <p className="assistant-prompt">ספרי מה יש לך במטבח, למה יש לך חשק, או כמה זמן יש לך.</p>
            <form onSubmit={submitHeroSearch} className={cn("assistant-composer", composerAttention && "is-attention", isSearching && "is-searching")}>
              <Search className="w-5 h-5 shrink-0" strokeWidth={2.1} aria-hidden="true" />
              <input
                ref={composerRef}
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="יש לי עוף, אורז ועגבניות..."
                aria-label="מה בא לך להכין"
              />
              <button type="submit" disabled={isSearching} aria-label="חיפוש מתכון" title="חיפוש מתכון">
                {isSearching ? <LoaderCircle className="w-5 h-5 animate-spin" strokeWidth={2.4} /> : <ArrowUp className="w-5 h-5" strokeWidth={2.4} />}
              </button>
            </form>
            <div className={cn("assistant-thinking", isSearching && "is-visible")} role="status" aria-live="polite">
              <span className="assistant-thinking-dots" aria-hidden="true"><i /><i /><i /></span>
              מחפשת באוסף שלך
            </div>
            <div className="assistant-suggestions" aria-label="רעיונות להתחלה">
              {QUICK_STARTS.map((prompt) => (
                <button key={prompt} type="button" className={cn("assistant-chip", activeQuickStart === prompt && "is-selected")} onClick={() => startWithPrompt(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <div className="assistant-actions">
              <Link href={user ? "/recipe/new" : "/register"}>
                <Plus className="w-4 h-4" strokeWidth={2.2} />
                {user ? "הוספת מתכון" : "פתיחת ספר מתכונים"}
              </Link>
              <Link href="/search">
                <Search className="w-4 h-4" strokeWidth={2.2} />
                חיפוש באוסף
              </Link>
            </div>
          </Reveal>
          <WritingCard />
        </div>
      </CinematicSection>

      <CinematicSection id="categories" tone="bark" index={1} enter="right" className="home-panel-categories">
        <div className="bleed-inner pt-1 pb-3 sm:pb-8">
          <Reveal>
            <h2 className="display-lg" style={{ color: "#FAF8F3" }}>מה מבשלים<br />היום?</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex items-center gap-3 mt-2 sm:mt-3 mb-3 sm:mb-5">
              <span className="plus-badge" style={{ color: "#FAF8F3" }}><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
              <p className="text-sm sm:text-lg" style={{ color: "#D5E4D7" }}>בחרו סוג מנה, קפצו ישר למתכונים, ותנו לרעב להחליט את השאר.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.name} delay={80 + i * 70}>
                <button onClick={() => handleCategoryClick(cat.name)} className="cat-tile group w-full">
                  <div className="category-photo relative aspect-square rounded-full overflow-hidden mb-1.5 sm:mb-3 mx-auto w-[52%] sm:w-[64%] lg:w-[72%] max-w-[5.25rem] sm:max-w-[11rem] lg:max-w-[15rem]"
                    style={{ boxShadow: "0 16px 36px rgba(12,40,31,0.35)" }}>
                    <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 22vw, (max-width: 1024px) 28vw, 18rem" />
                  </div>
                  <p className="home-index home-index--category tabular" style={{ color: "#D97757" }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-[0.92rem] sm:text-lg lg:text-xl font-extrabold text-bark-500 group-hover:text-cinnamon-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block text-[13px] text-smoke-200 mt-1 leading-snug">{cat.desc}</p>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </CinematicSection>

      <CinematicSection id="recipes" tone="cream" index={2} enter="left" className="home-panel-recipes">
        <div className="bleed-inner py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 shrink-0">
            <Reveal>
              <div>
                <h2 className="display-lg text-bark-500">מתכונים מהאוסף</h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="plus-badge text-bark-500"><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
                  <p className="text-bark-300 text-lg">רעיונות טובים לפתוח, לשמור או לשלוח לרשימת הקניות</p>
                </div>
              </div>
            </Reveal>

            <div className="flex items-center gap-3">
              <Link href="/search" className="text-sm font-bold text-bark-300 hover:text-cinnamon-500 inline-flex items-center min-h-[24px]">
                לכל המתכונים
              </Link>
              <button onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-5 h-12 text-sm font-bold border transition-all",
                  showFilters || filtersActive
                    ? "bg-cinnamon-500 border-cinnamon-500 text-forest-300"
                    : "bg-transparent border-bark-400 text-bark-400",
                )}
                style={{ borderRadius: 999 }}>
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
            <div className="card-surface mt-5 p-5 space-y-4 shrink-0">
              <FilterRow label="רמת קושי" opts={DIFFICULTY_OPTS} active={difficulty} onSelect={setDifficulty} />
              <FilterRow label="כשרות" opts={KOSHER_OPTS} active={kosher} onSelect={setKosher} />
              <FilterRow label="זמן הכנה" opts={TIME_OPTS} active={String(maxTime)} onSelect={(v) => setMaxTime(Number(v))} />
            </div>
          )}

          <div className="mt-8">
            {loading ? (
              <RecipeLoading label="מחפשת מה טוב להכין" kind="search" />
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <Mark name="collection" className="w-32 mx-auto mb-5" sizes="128px" decorative />
                <h3 className="display-md text-bark-500 mb-3">
                  {filtersActive ? "שום מתכון לא תפס את הסינון" : "האוסף עדיין ריק"}
                </h3>
                <p className="text-bark-200 mb-9 text-[15px]">
                  {filtersActive ? "נסו לשחרר מסנן אחד, ותראו מה נפתח." : "אפשר להיות הראשונים לכתוב מתכון."}
                </p>
                {filtersActive ? (
                  <button onClick={clearFilters} className="btn-block">מנקים את הסינון</button>
                ) : user ? (
                  <Link href="/recipe/new" className="btn-block">כותבים מתכון ראשון</Link>
                ) : null}
              </div>
            ) : gridRecipes.length === 0 ? (
              <p className="text-center py-10 text-bark-200 text-[15px]">
                זה כל מה שיש כרגע — המתכון היחיד מחכה למטה.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gridRecipes.map((recipe, i) => (
                  <Reveal key={recipe.id} delay={(i % 3) * 90}>
                    <RecipeCard recipe={recipe} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </CinematicSection>

      {editorPick && (
        <CinematicSection id="weekly" tone="bark" index={3} enter="bottom" className="home-panel-weekly">
          <div className="bleed-inner weekly-spread">
            <div className="glass-stage">
              <div className="weekly-spread-grid">
                <Reveal>
                  <Link href={`/recipe/${editorPick.id}`} className="weekly-photo-frame relative block group">
                    <div className="weekly-photo relative aspect-square rounded-full overflow-hidden border border-cream-50/20"
                      style={{ boxShadow: "0 28px 70px rgba(12,40,31,0.45)" }}>
                      {editorPick.image_url ? (
                        <Image src={editorPick.image_url} alt={editorPick.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 70vw, 34rem" />
                      ) : (
                        <Image src="/food/dessert-v4.png" alt="" fill className="object-cover" sizes="(max-width: 768px) 70vw, 34rem" />
                      )}
                    </div>
                    <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold z-10"
                      style={{ background: "#D97757", color: "#FAF8F3", borderRadius: 999 }}>
                      {new Date().toLocaleDateString("he-IL", { weekday: "long" })}
                    </span>
                  </Link>
                </Reveal>

                <Reveal delay={140}>
                  <p className="eyebrow mb-4">המתכון של השבוע</p>
                  <h2 className="display-lg" style={{ color: "#FAF8F3" }}>
                    {editorPick.title}
                  </h2>
                  {editorPick.description && (
                    <p className="mt-5 text-base leading-relaxed line-clamp-4" style={{ color: "#D5E4D7" }}>
                      {editorPick.description}
                    </p>
                  )}
                  <Link href={`/recipe/${editorPick.id}`} className="btn-outline mt-8">
                    פותחים את המתכון
                  </Link>
                </Reveal>
              </div>
            </div>
          </div>
        </CinematicSection>
      )}

      <CinematicSection id="why" tone="cream" index={editorPick ? 4 : 3} enter={editorPick ? "top" : "bottom"} className="home-panel-why">
        <div className="bleed-inner py-12 sm:py-16">
          <Reveal>
            <h2 className="display-md text-bark-500">למה לשמור כאן?</h2>
            <div className="flex items-center gap-3 mt-4 mb-8">
              <span className="plus-badge text-bark-500"><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
              <p className="text-bark-300 text-[15px]">כי מתכון טוב לא צריך ללכת לאיבוד בין צילומי מסך, הודעות וקבצים ישנים.</p>
            </div>
          </Reveal>
          <div style={{ borderTop: "1px solid rgba(39,94,80,0.14)" }}>
            {REASONS.map((r, i) => (
              <Reveal key={r.t} delay={(i % 3) * 60}>
                <div
                  className="row-wipe w-full text-right py-4 sm:py-5 flex items-start sm:items-center gap-5 sm:gap-8"
                  style={{ borderBottom: "1px solid rgba(39,94,80,0.14)" }}
                >
                  <span className="home-index home-index--reason tabular text-cinnamon-500 pt-1 sm:pt-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-bark-500">
                    {r.t}
                  </span>
                  <span className="hidden sm:block flex-1 text-[14px] text-bark-300 leading-relaxed">
                    {r.d}
                  </span>
                  <span className="plus-badge mr-auto text-bark-500 hidden sm:inline-flex">
                    <Plus className="w-4 h-4" strokeWidth={2.4} />
                  </span>
                </div>
                <p className="sm:hidden text-[14px] text-bark-300 leading-relaxed pb-4 pr-14">
                  {r.d}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </CinematicSection>

      <CinematicSection id="join" tone="bark" index={editorPick ? 5 : 4} enter={editorPick ? "right" : "top"} className="home-panel-join">
        <div className="bleed-inner py-12 sm:py-16">
          <div className="home-join-callout min-h-[22rem] flex items-center justify-center text-center">
            <div className="relative z-10 px-6 py-14 max-w-xl">
              <p className="eyebrow mb-5">הספר שלך</p>
              <Reveal>
                <h2 className="display-hero" style={{ color: "#102B22" }}>
                  יש מתכון
                  <br />
                  ששווה לשמור?
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-xl mt-5" style={{ color: "#18382D" }}>כותבים פעם אחת — והוא נשאר מסודר, ברור ומוכן לבישול הבא.</p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                  <Link href={user ? "/recipe/new" : "/register"} className="home-join-primary">
                    {user ? "שומרים מתכון" : "פותחים ספר מתכונים"}
                  </Link>
                  {!user && (
                    <Link href="/login" className="font-medium hover:text-forest-500" style={{ color: "#102B22" }}>
                      כבר רשומים? כניסה
                    </Link>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </CinematicSection>
      </HomeStack>

    </div>
  );
}

const ENTER_FROM = {
  right: [100, 0],
  left: [-100, 0],
  bottom: [0, 100],
  top: [0, -100],
} as const;

type EnterDir = keyof typeof ENTER_FROM;

function stackSpan(stack: Element) {
  const raw = Number(getComputedStyle(stack).getPropertyValue("--stack-span"));
  return Number.isFinite(raw) && raw > 0 ? raw : 1.15;
}

function HomeStack({ count, children }: { count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = ref.current;
    if (!stack) return;
    const stage = stack.querySelector<HTMLElement>(".home-stack-stage");
    if (!stage) return;

    const jumpHash = () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (!id) return;
      const el = stack.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!el) return;
      const index = Number(el.dataset.stackIndex);
      if (!Number.isFinite(index)) return;
      window.scrollTo({ top: index * stage.clientHeight * stackSpan(stack) });
    };

    jumpHash();
    window.addEventListener("hashchange", jumpHash);
    return () => window.removeEventListener("hashchange", jumpHash);
  }, [count]);

  return (
    <div
      ref={ref}
      className="full-bleed stack-root home-stack"
      style={{ ["--stack-count" as string]: count }}
    >
      <div className="home-stack-stage">{children}</div>
    </div>
  );
}

function CinematicSection({
  id, tone, children, index = 0, enter, className,
}: {
  id: string;
  tone: "cream" | "bark";
  children: React.ReactNode;
  index?: number;
  enter?: EnterDir;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const scaleRef = useRef(1);
  const isFirst = index === 0;
  const [inView, setInView] = useState(isFirst);
  const [scale, setScale] = useState(1);

  /* A pinned panel can only ever show one screenful. Copy that overruns the
     screen by a little is scaled down to fit — barely noticeable, and it keeps
     the panel in the stack. Only copy that would have to shrink past
     MIN_SCALE leaves the stack and scrolls normally instead. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const copy = el.querySelector<HTMLElement>(".panel-copy");
    const inner = copy?.firstElementChild as HTMLElement | null;
    if (!inner) return;

    const measure = () => {
      const available = window.innerHeight - 64;
      const padding = parseFloat(getComputedStyle(copy!).paddingBottom) || 0;
      const natural = inner.getBoundingClientRect().height / (scaleRef.current || 1) + padding;
      const next = natural > available ? Math.max(0.68, available / natural) : 1;
      scaleRef.current = next;
      setScale(next);
    };
    measure();
    // The webfont lands after the first measurement and reflows the copy.
    document.fonts?.ready.then(measure).catch(() => {});
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enter) {
      setInView(true);
      return;
    }

    const stack = el.closest(".home-stack");
    const stage = stack?.querySelector<HTMLElement>(".home-stack-stage");
    if (!stack || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const [fromX, fromY] = ENTER_FROM[enter];
    let raf = 0;
    let shown = false;

    const update = () => {
      raf = 0;
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 64;
      const stageH = stage.clientHeight || Math.max(1, window.innerHeight - headerBottom);
      const scrolled = Math.max(0, headerBottom - stack.getBoundingClientRect().top);
      let p = scrolled / (stageH * stackSpan(stack)) - (index - 1);
      p = Math.min(1, Math.max(0, p));
      if (reduce.matches) p = p >= 0.45 ? 1 : 0;
      el.style.transform = `translate3d(${fromX * (1 - p)}%, ${fromY * (1 - p)}%, 0)`;
      el.style.pointerEvents = p > 0.88 ? "auto" : "none";
      const nextShown = p > 0.08;
      if (nextShown !== shown) {
        shown = nextShown;
        setInView(nextShown);
      }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enter, index]);

  return (
    <section
      ref={ref}
      id={id}
      data-stack-index={index}
      data-enter={enter}
      className={cn(
        "stack-panel",
        isFirst && "is-first",
        tone === "bark" ? "panel-bark" : "panel-cream",
        inView && "in-view",
        className,
      )}
      style={{ ["--stack-z" as string]: index + 1, ["--panel-scale" as string]: scale }}>
      <div className="cinematic-slabs" aria-hidden="true">
        <span className="slab slab-a" />
        <span className="slab slab-b slab-left slab-delay-1" />
        <span className="slab slab-c slab-left slab-delay-2" />
      </div>
      <div className="panel-copy">{children}</div>
    </section>
  );
}

function JoinBar({ user }: { user: { username?: string } | null }) {
  const [hidden, setHidden] = useState(false);
  const [atCta, setAtCta] = useState(true);

  /* The hero and the closing panel both carry this exact call to action, so the
     bar only shows in between them. Measured off layout, not visibility — a
     pinned panel stays inside the viewport all the way down. */
  useEffect(() => {
    const afterHero = document.querySelector('[data-sentinel="after-hero"]');
    const beforeLast = document.querySelector('[data-sentinel="before-last"]');
    if (!afterHero || !beforeLast) return;

    let pastHero = false;
    let atLast = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.target === afterHero) pastHero = e.boundingClientRect.top <= 0;
          else atLast = e.isIntersecting || e.boundingClientRect.top <= 0;
        });
        setAtCta(!pastHero || atLast);
      },
      { threshold: 0 },
    );
    io.observe(afterHero);
    io.observe(beforeLast);
    return () => io.disconnect();
  }, []);

  if (hidden || atCta) return null;

  return (
    <div className="home-join-bar hidden md:flex fixed bottom-0 inset-x-0 z-40 items-center justify-between gap-6 px-8 py-4"
      style={{ background: "rgba(12, 24, 20, 0.94)", borderTop: "1px solid rgba(250,248,243,0.18)", backdropFilter: "blur(16px)" }}>
      <p className="font-extrabold text-lg" style={{ color: "#FAF8F3" }}>המתכונים של הבית ורשימת הקניות — באותו מקום</p>
      <div className="flex items-center gap-4">
        <Link href={user ? "/recipe/new" : "/register"} className="btn-cream">
          {user ? "שמירת מתכון" : "פותחים ספר"}
        </Link>
        <button onClick={() => setHidden(true)} className="text-forest-100 hover:text-cinnamon-200" aria-label="סגירה">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/** Hairline marker in the stack's flow — the panels themselves pin, so their own
 *  position can't say how far down the page you are. One pixel, not zero: an
 *  observer never reports a zero-area target as intersecting. */
function StackSentinel({ name }: { name: string }) {
  return <div data-sentinel={name} aria-hidden="true" style={{ height: 1 }} />;
}

function Reveal({
  children, delay = 0, className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("reveal", className)}
      style={{ animationDelay: `${delay}ms` }}>
      {children}
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
      className="section-rail hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center py-6 px-3"
      style={{
        background: "#102B22",
        borderInlineStart: "1px solid rgba(250,248,243,0.18)",
      }}
      aria-label="ניווט בין חלקי הדף">
      {sections.map((s, i) => {
        const isActive = active === s.id;
        return (
          <a key={s.id} href={`#${s.id}`}
            className="section-rail-link py-2"
            aria-current={isActive ? "true" : undefined}>
            <span className={cn("section-rail-index tabular font-extrabold transition-colors",
              isActive
                ? onDark ? "text-cinnamon-200" : "text-cinnamon-500"
                : onDark ? "text-forest-100/70" : "text-bark-200")}>
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
      <p className="text-xs font-bold text-bark-200 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={o.v} onClick={() => onSelect(String(o.v))}
            className={cn("px-4 py-2 text-[13px] font-bold border transition-all",
              String(active) === String(o.v)
                ? "bg-cinnamon-500 border-cinnamon-500 text-surface-100"
                : "bg-transparent border-surface-500 text-bark-300 hover:border-bark-500 hover:text-bark-500",
            )}
            style={{ borderRadius: 999 }}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}
