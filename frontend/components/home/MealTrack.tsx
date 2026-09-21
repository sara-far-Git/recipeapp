"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { getCategory } from "@/lib/categories";

/** The five courses of a meal, in the order they reach the table. The site's
 *  own categories, minus drinks — a meal is not served by its drinks. */
const COURSES = ["ראשונות", "סלטים", "עיקריות", "מאפים", "קינוחים"] as const;
const ORDINAL = ["ראשונה", "שנייה", "שלישית", "רביעית", "חמישית"];
const DWELL_MS = 5200;

/** One small line drawing per course, in the stroke of the logo's own cutlery. */
const ICONS: Record<(typeof COURSES)[number], React.ReactNode> = {
  ראשונות: <><path d="M4 13h16a8 8 0 0 1-16 0z" /><path d="M12 5v3M9 6l1 2M15 6l-1 2" /></>,
  סלטים: <><path d="M12 20c-5 0-8-4-8-9 4 0 7 2 8 6 1-4 4-6 8-6 0 5-3 9-8 9z" /><path d="M12 20v-6" /></>,
  עיקריות: <><path d="M3 17h18" /><path d="M5 17a7 7 0 0 1 14 0" /><path d="M12 8V6" /><circle cx="12" cy="5" r="1" /></>,
  מאפים: <><path d="M4 12a8 5 0 0 1 16 0v5H4z" /><path d="M8 12v5M12 11v6M16 12v5" /></>,
  קינוחים: <><path d="M3 20h18" /><path d="M5 20V12l7-4 7 4v8" /><path d="M5 14c2 1 3 1 5 0s3-1 4 0 2 1 5 0" /><circle cx="12" cy="6" r="1.2" /></>,
};

/** The opening photograph, as a meal.
 *
 *  A single stock photograph used to sit here and say nothing. This walks
 *  through the courses: the category's own picture, its own line, and a way
 *  in. It moves on its own and stops under the pointer; the page's scrolling
 *  is never taken from the reader, and the headline and search beside it are
 *  not touched.
 */
export default function MealTrack() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  // Whether it moves by itself. Off from the start where there is no pointer
  // to hold it still — on a phone the button on the photograph would change
  // under a thumb already reaching for it — and off for anyone who asked for
  // reduced motion. Off for good the moment the reader takes it over, and
  // after one full turn of the meal: it shows the five courses once and then
  // stands where the reader can see it, instead of pulling the eye away from
  // the search box beside it for as long as the page is open.
  const [playing, setPlaying] = useState(false);
  const hovered = useRef(false);
  const startedAt = useRef(0);
  const turns = useRef(0);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || window.matchMedia("(hover: none)").matches;
    if (!still) setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    startedAt.current = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (!hovered.current && !document.hidden) {
        const p = Math.min(1, (now - startedAt.current) / DWELL_MS);
        setProgress(p);
        if (p >= 1) {
          startedAt.current = now;
          setActive((i) => {
            const next = (i + 1) % COURSES.length;
            if (next === 0 && ++turns.current >= 1) setPlaying(false);
            return next;
          });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const resume = () => { startedAt.current = performance.now(); };
    document.addEventListener("visibilitychange", resume);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", resume); };
  }, [playing]);

  const go = (i: number) => {
    setActive((i + COURSES.length) % COURSES.length);
    setProgress(0);
    setPlaying(false);
  };
  const toggle = () => {
    turns.current = 0;
    setProgress(0);
    setPlaying((p) => !p);
  };

  // The line fills from the current stop toward the next one.
  const seg = 100 / (COURSES.length - 1);
  const fill = active === COURSES.length - 1 ? 100 : active * seg + (playing ? progress : 0) * seg;

  return (
    <>
      <div
        className="hero-split-photo meal-stage"
        onMouseEnter={() => { hovered.current = true; }}
        onMouseLeave={() => { hovered.current = false; startedAt.current = performance.now(); }}
      >
        {COURSES.map((name, i) => {
          const c = getCategory(name);
          if (!c) return null;
          return (
            <figure key={name} className={`meal-slide${i === active ? " is-active" : ""}`} aria-hidden={i !== active}>
              <Image src={c.image} alt="" fill priority={i === 0} sizes="(max-width: 700px) 100vw, 50vw" className="object-cover" />
              <figcaption className="meal-caption">
                <span className="meal-eyebrow">מנה {ORDINAL[i]}</span>
                <span className="meal-name">{name}</span>
                <span className="meal-line">{c.desc}</span>
                <Link href={`/category/${encodeURIComponent(name)}`} className="meal-cta" tabIndex={i === active ? 0 : -1}>
                  לכל ה{name}<span aria-hidden="true">←</span>
                </Link>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <nav
        className="meal-track"
        aria-label="מנות הארוחה"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(active + 1);   // RTL: left is forward
          if (e.key === "ArrowRight") go(active - 1);
        }}
      >
        <ol style={{ ["--fill" as string]: `${fill}%` }}>
          <span className="meal-fill" aria-hidden="true" />
          {COURSES.map((name, i) => (
            <li key={name} className={`meal-stop${i === active ? " is-active" : i < active ? " is-done" : ""}`}>
              <button type="button" aria-label={name} aria-current={i === active ? "true" : "false"} onClick={() => go(i)}>
                <span className="meal-dot">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONS[name]}
                  </svg>
                </span>
                <span className="meal-label">{name}</span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="meal-toggle" onClick={toggle} aria-pressed={playing}
          aria-label={playing ? "עצירת ההחלפה האוטומטית" : "הפעלת ההחלפה האוטומטית"} title={playing ? "עצירה" : "הפעלה"}>
          {playing ? <Pause className="w-4 h-4" strokeWidth={2.2} /> : <Play className="w-4 h-4" strokeWidth={2.2} />}
        </button>
      </nav>
    </>
  );
}
