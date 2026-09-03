"use client";

/**
 * The hero's moving mark: an index card that writes itself.
 *
 * A card rises out of the box, its tab slides up with the category, the ruled
 * lines draw left to right, and the recipe's name and facts land on them one
 * after another — the site's own object doing the thing the site is for. Then
 * it settles back and the next recipe starts.
 *
 * Real recipes when the page has them, three stand-ins before they arrive.
 * The whole cycle is CSS keyframes driven off a React index, so nothing
 * animates per frame in JS; reduced-motion holds the first card still.
 */
import { useEffect, useState } from "react";

type Sample = { title: string; category: string; serves: number; minutes: number };

const FALLBACK: Sample[] = [
  { title: "עוגת גבינה וריבת חלב", category: "קינוחים", serves: 12, minutes: 70 },
  { title: "עוף בלימון וטימין", category: "עיקריות", serves: 4, minutes: 55 },
  { title: "לחם כפרי בסיר", category: "מאפים", serves: 8, minutes: 80 },
];

/** Tab tone per category — the same six the recipe cards use. */
const TONE: Record<string, string> = {
  ראשונות: "#1E4D45",
  עיקריות: "#2F6B5D",
  מאפים: "#E9EFEA",
  קינוחים: "#D97757",
  סלטים: "#F4EEDF",
  משקאות: "#C19A52",
};
const INK: Record<string, string> = {
  מאפים: "#1E4D45",
  סלטים: "#275E50",
  משקאות: "#23331F",
};

const STEP_MS = 4200;

export default function WritingCard({ recipes }: { recipes?: any[] }) {
  const cards: Sample[] =
    recipes && recipes.length
      ? recipes.slice(0, 3).map((r) => ({
          title: r.title,
          category: r.category || "מתכון",
          serves: r.servings || 4,
          minutes: (r.prep_time_minutes || 0) + (r.cook_time_minutes || 0),
        }))
      : FALLBACK;

  const [i, setI] = useState(0);

  useEffect(() => {
    if (cards.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % cards.length), STEP_MS);
    return () => window.clearInterval(t);
  }, [cards.length]);

  const card = cards[i];
  const tone = TONE[card.category] ?? "#2F6B5D";
  const ink = INK[card.category] ?? "#FAF8F3";

  return (
    <div className="writing-card" aria-hidden="true">
      {/* the box the card is drawn from */}
      <span className="writing-card__box" />

      {/* two cards still in the box */}
      <span className="writing-card__behind writing-card__behind--2" />
      <span className="writing-card__behind writing-card__behind--1" />

      {/* the card being written — keyed so every cycle replays the animation */}
      <article className="writing-card__sheet" key={i}>
        <span className="writing-card__tab" style={{ background: tone, color: ink }}>
          {card.category}
        </span>

        <p className="writing-card__eyebrow">RECIPE</p>
        <span className="writing-card__flourish" />

        <div className="writing-card__line writing-card__line--title">
          <span className="writing-card__label">TITLE</span>
          <span className="writing-card__rule" />
          <span className="writing-card__written">{card.title}</span>
        </div>

        <div className="writing-card__line writing-card__line--serves">
          <span className="writing-card__label">SERVES</span>
          <span className="writing-card__rule" />
          <span className="writing-card__written">
            {card.serves}
            {card.minutes > 0 && ` · ${card.minutes} דק׳`}
          </span>
        </div>

        <span className="writing-card__leaf" />
      </article>
    </div>
  );
}
