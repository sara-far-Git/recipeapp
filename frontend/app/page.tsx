"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { recipesApi, searchApi } from "@/lib/api";
import RecipeCard from "@/components/recipe/RecipeCard";
import { ChefHat, SlidersHorizontal, X, Plus, Users, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import LogoIntro from "@/components/brand/LogoIntro";

const DIFFICULTY_OPTS = [{ v: "", l: "כל הרמות" }, { v: "easy", l: "קל" }, { v: "medium", l: "בינוני" }, { v: "hard", l: "מאתגר" }];
const KOSHER_OPTS = [{ v: "", l: "כל הסוגים" }, { v: "meat", l: "בשרי" }, { v: "dairy", l: "חלבי" }, { v: "pareve", l: "פרווה" }];
const TIME_OPTS = [{ v: 0, l: "כל הזמנים" }, { v: 15, l: "עד 15 דק'" }, { v: 30, l: "עד 30 דק'" }, { v: 60, l: "עד שעה" }];

const REASONS = [
  { t: "הכל במקום אחד",   d: "מתכונים מסודרים לפי סוג, קושי וזמן. בלי לחפש במחברות ובצילומים." },
  { t: "סינון שחותך",      d: "כשרות, רמה וזמן — נשאר בדיוק מה שמתאים להיום." },
  { t: "רשימת קניות",      d: "בוחרים מתכונים, והרשימה נבנית לבד. יוצאים לקנות עם מה שחסר." },
  { t: "מה שבאמת עובד",    d: "לייקים, דירוגים ותגובות מהמטבחים של אחרים — לא רק תמונה יפה." },
  { t: "שמירה לכל מכשיר",  d: "סימניה אחת, וחוזרים לאותו מתכון מהטלפון או מהמחשב." },
  { t: "מול המסך",         d: "מבשלים מהמחשב, ידיים על הסיר, בלי להלכלך דף." },
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

  const editorPick = filtersActive ? null : recipes[0];
  const gridRecipes = (filtersActive ? recipes : recipes.slice(1)).slice(0, 3);

  const sections = [
    { id: "hero", label: "פתיחה", dark: true },
    { id: "categories", label: "קטגוריות", dark: true },
    { id: "recipes", label: "האוסף", dark: true },
    ...(editorPick ? [{ id: "weekly", label: "השבוע", dark: true }] : []),
    { id: "why", label: "למה כאן", dark: true },
    { id: "join", label: "הצטרפות", dark: true },
  ];

  return (
    <div>
      <LogoIntro />
      <SectionRail sections={sections} />

      <div className="full-bleed stack-root">
      <CinematicSection id="hero" tone="bark" layer={1}>
        <div className="bleed-inner py-8 sm:py-10">
          <div className="glass-stage overflow-visible">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-2 items-center px-6 py-10 sm:px-10 lg:pl-14 lg:pr-8">
              <div className="order-2 lg:order-1">
                <Reveal>
                  <p className="eyebrow mb-4">ספר אחד לבית</p>
                  <div className="flex items-start gap-4">
                    <span className="gold-rule mt-2 hidden sm:block" />
                    <h1 className="display-hero" style={{ color: "#e8ebe7" }}>
                      מה תרצו<br /><span style={{ color: "#e86b24" }}>לבשל היום?</span>
                    </h1>
                  </div>
                </Reveal>
                <Reveal delay={120}>
                  <p className="mt-5 text-lg sm:text-xl font-medium max-w-sm leading-snug" style={{ color: "#b4bbb4" }}>
                    {user ? "מה על השולחן הערב?" : "שומרים מה שעובד, מוצאים כשצריך, וקונים בדיוק מה שחסר."}
                  </p>
                  <div className="flex flex-wrap items-center gap-5 mt-6 text-sm font-bold" style={{ color: "#c5cbc6" }}>
                    <span className="inline-flex items-center gap-2"><Users className="w-4 h-4 text-cinnamon-300" strokeWidth={1.8} /> קהילה מבשלת</span>
                    <span className="inline-flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-cinnamon-300" strokeWidth={1.8} /> רשימת קניות</span>
                  </div>
                </Reveal>
                <Reveal delay={220}>
                  <div className="flex flex-wrap items-center gap-4 mt-8">
                    <Link href={user ? "/recipe/new" : "/register"} className="btn-cream inline-flex">
                      {user ? "מתכון חדש" : "פותחים חשבון"}
                    </Link>
                    <Link href="/search" className="btn-outline">לכל המתכונים</Link>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={80} className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
                <div className="food-orb">
                  <Image src="/food/hero.png" alt="קערת ירקות קלויים" fill className="object-cover" sizes="(max-width: 1024px) 90vw, 36rem" priority />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </CinematicSection>

      <StackSentinel name="after-hero" />

      <CinematicSection id="categories" tone="bark" layer={2}>
        <div className="bleed-inner pt-1 pb-6 sm:pb-8">
          <Reveal>
            <h2 className="display-lg" style={{ color: "#e8ebe7" }}>מה מבשלים<br />היום?</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex items-center gap-3 mt-3 mb-5">
              <span className="plus-badge" style={{ color: "#e8ebe7" }}><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
              <p className="text-lg" style={{ color: "#b4bbb4" }}>בחרו סוג מנה — ותגיעו ישר למתכונים</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.name} delay={80 + i * 70}>
                <button onClick={() => handleCategoryClick(cat.name)} className="cat-tile group w-full">
                  <div className="relative aspect-square rounded-full overflow-hidden mb-3 mx-auto w-[72%] max-w-[15rem]"
                    style={{ boxShadow: "0 16px 36px rgba(0,0,0,0.35)" }}>
                    <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 40vw, 18rem" />
                  </div>
                  <p className="tabular text-xs font-bold mb-1" style={{ color: "#e86b24" }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-bark-500 group-hover:text-cinnamon-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block text-[13px] text-smoke-200 mt-1 leading-snug">{cat.desc}</p>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </CinematicSection>

      <CinematicSection id="recipes" tone="cream" layer={3}>
        <div className="bleed-inner py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 shrink-0">
            <Reveal>
              <div>
                <h2 className="display-lg text-bark-500">מהאוסף</h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="plus-badge text-bark-500"><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
                  <p className="text-bark-300 text-lg">שלושה ששווה לפתוח עכשיו</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="card-surface overflow-hidden">
                    <div className="animate-pulse" style={{ aspectRatio: "4/3", background: "#1a332b" }} />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-16" style={{ background: "#1a332b" }} />
                      <div className="h-5 w-3/4" style={{ background: "#1a332b" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="w-12 h-12 mx-auto text-bark-200 mb-6" strokeWidth={1.2} />
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
        <CinematicSection id="weekly" tone="bark" layer={4}>
          <div className="bleed-inner py-10">
            <div className="glass-stage overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center px-6 py-10 sm:px-10">
                <Reveal>
                  <Link href={`/recipe/${editorPick.id}`} className="relative block group mx-auto md:mx-0" style={{ width: "min(100%, 22rem)" }}>
                    <div className="relative aspect-square rounded-full overflow-hidden border border-white/10"
                      style={{ boxShadow: "0 28px 70px rgba(0,0,0,0.45)" }}>
                      {editorPick.image_url ? (
                        <Image src={editorPick.image_url} alt={editorPick.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="22rem" />
                      ) : (
                        <Image src="/food/dessert.png" alt="" fill className="object-cover" sizes="22rem" />
                      )}
                    </div>
                    <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold z-10"
                      style={{ background: "#e86b24", color: "#0c1814", borderRadius: 999 }}>
                      {new Date().toLocaleDateString("he-IL", { weekday: "long" })}
                    </span>
                  </Link>
                </Reveal>

                <Reveal delay={140}>
                  <p className="eyebrow mb-4">המתכון של השבוע</p>
                  <h2 className="display-lg" style={{ color: "#e8ebe7" }}>
                    {editorPick.title}
                  </h2>
                  {editorPick.description && (
                    <p className="mt-5 text-base leading-relaxed line-clamp-4" style={{ color: "#b4bbb4" }}>
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

      <CinematicSection id="why" tone="cream" layer={5}>
        <div className="bleed-inner py-12 sm:py-16">
          <Reveal>
            <h2 className="display-md text-bark-500">למה כאן</h2>
            <div className="flex items-center gap-3 mt-4 mb-8">
              <span className="plus-badge text-bark-500"><Plus className="w-4 h-4" strokeWidth={2.4} /></span>
              <p className="text-bark-300 text-[15px]">הכלים שמשתמשים בהם באמת, לא רק פעם אחת</p>
            </div>
          </Reveal>
          <div style={{ borderTop: "1px solid rgba(232,235,231,0.14)" }}>
            {REASONS.map((r, i) => (
              <Reveal key={r.t} delay={(i % 3) * 60}>
                <div
                  className="row-wipe w-full text-right py-4 sm:py-5 flex items-start sm:items-center gap-5 sm:gap-8"
                  style={{ borderBottom: "1px solid rgba(232,235,231,0.14)" }}
                >
                  <span className="tabular text-sm w-8 text-cinnamon-500 font-extrabold pt-1 sm:pt-0">
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

      <StackSentinel name="before-last" />

      <CinematicSection id="join" tone="bark" layer={6}>
        <div className="bleed-inner py-12 sm:py-16">
          <div className="relative overflow-hidden min-h-[22rem] flex items-center justify-center text-center">
            <ParallaxPhoto src="/food/mezze.png" alt="" />
            <div className="absolute inset-0" style={{ background: "rgba(12,24,20,0.62)" }} />
            <div className="relative z-10 px-6 py-14 max-w-xl">
              <Reveal>
                <h2 className="display-hero" style={{ color: "#e8ebe7" }}>
                  יש מתכון
                  <br />
                  ששווה לשמור?
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-xl mt-5" style={{ color: "#d8ddd8" }}>כותבים פעם אחת — והוא נשאר, עם רשימת קניות מוכנה.</p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                  <Link href={user ? "/recipe/new" : "/register"} className="btn-cream">
                    {user ? "כותבים מתכון" : "פותחים חשבון"}
                  </Link>
                  {!user && (
                    <Link href="/login" className="font-bold hover:text-cinnamon-200" style={{ color: "#e8ebe7" }}>
                      כבר רשומים? כניסה
                    </Link>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
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
  const scaleRef = useRef(1);
  const isFirst = layer === 1;
  const [inView, setInView] = useState(isFirst);
  const [tall, setTall] = useState(false);
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
      setTall(false);
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
    if (!el) return;
    if (isFirst || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const mark = () => setInView(true);
    if (window.location.hash === `#${id}`) mark();
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) mark();
    }, { threshold: 0.08 });
    io.observe(el);
    const onHash = () => { if (window.location.hash === `#${id}`) mark(); };
    window.addEventListener("hashchange", onHash);
    return () => {
      io.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, [isFirst, id]);

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "stack-panel",
        isFirst && "is-first",
        tall && "is-tall",
        tone === "bark" ? "panel-bark" : "panel-cream",
        inView && "in-view",
        className,
      )}
      style={{ ["--stack-z" as string]: layer, ["--panel-scale" as string]: scale }}>
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
    <div className="hidden md:flex fixed bottom-0 inset-x-0 z-40 items-center justify-between gap-6 px-8 py-4"
      style={{ background: "rgba(12, 24, 20, 0.88)", borderTop: "1px solid rgba(232,235,231,0.12)", backdropFilter: "blur(16px)" }}>
      <p className="font-extrabold text-lg" style={{ color: "#e8ebe7" }}>המתכונים ורשימת הקניות — באותו מקום</p>
      <div className="flex items-center gap-4">
        <Link href={user ? "/recipe/new" : "/register"} className="btn-cream">
          {user ? "מתכון חדש" : "פותחים חשבון"}
        </Link>
        <button onClick={() => setHidden(true)} className="text-cream-200 hover:text-cream-100" aria-label="סגירה">
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

function ParallaxPhoto({ src, alt }: { src: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const layer = layerRef.current;
    if (!wrap || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const shift = ((rect.top + rect.height / 2 - view / 2) / view) * -64;
      layer.style.transform = `translate3d(0, ${shift}px, 0) scale(1.2)`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <div ref={layerRef} className="absolute inset-[-14%]" style={{ willChange: "transform" }}>
        <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
      </div>
    </div>
  );
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
        background: "#0c1814",
        borderInlineStart: "1px solid rgba(232,235,231,0.12)",
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
                : onDark ? "text-smoke-200" : "text-bark-200")}>
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
