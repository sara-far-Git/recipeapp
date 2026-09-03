"use client";

/**
 * The hero's mark: the recipe box from the reference, built in CSS.
 *
 * Two tabbed cards stand behind — one forest, one sage — and a cream card
 * leans out in front, tilted, with RECIPE set above a leaf flourish and the
 * TITLE and SERVES lines ruled in dots. It rests still until the pointer
 * arrives; then the card writes itself, and every pass after that brings the
 * next recipe. Real recipes when the page has them, stand-ins before.
 */
import { useEffect, useRef, useState } from "react";

type Sample = { title: string; category: string; serves: number; minutes: number };

/* The written lines are decoration, not information — nobody is meant to read
   the card, and the script face has no Hebrew. So the hand writes English,
   and the page's own recipes stay where they can actually be read. */
const CARDS: Sample[] = [
  { title: "Lemon & Thyme Chicken", category: "עיקריות", serves: 4, minutes: 55 },
  { title: "Cheesecake, Dulce de Leche", category: "קינוחים", serves: 12, minutes: 70 },
  { title: "Rustic Loaf in a Pot", category: "מאפים", serves: 8, minutes: 80 },
  { title: "Garden Salad, Soft Herbs", category: "סלטים", serves: 4, minutes: 12 },
  { title: "Grapefruit & Thyme Cooler", category: "משקאות", serves: 6, minutes: 8 },
  { title: "Roasted Root Soup", category: "ראשונות", serves: 6, minutes: 45 },
];

/** Tab tone per category — the six the recipe cards already use. */
const TONE: Record<string, { bg: string; fg: string }> = {
  ראשונות: { bg: "#1E4D45", fg: "#FAF8F3" },
  עיקריות: { bg: "#2F6B5D", fg: "#FAF8F3" },
  מאפים: { bg: "#E9EFEA", fg: "#1E4D45" },
  קינוחים: { bg: "#D97757", fg: "#FAF8F3" },
  סלטים: { bg: "#F4EEDF", fg: "#275E50" },
  משקאות: { bg: "#C19A52", fg: "#23331F" },
};

const STEP_MS = 3800;

export default function WritingCard() {
  const cards = CARDS;
  const [i, setI] = useState(0);
  const [writing, setWriting] = useState(false);
  const timer = useRef<number | null>(null);

  const stop = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  /** Nothing moves until the pointer arrives. */
  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setWriting(true);
    setI((n) => (n + 1) % cards.length);
    stop();
    if (cards.length > 1) {
      timer.current = window.setInterval(
        () => setI((n) => (n + 1) % cards.length),
        STEP_MS,
      );
    }
  };

  useEffect(() => stop, []);

  const card = cards[i];
  const tone = TONE[card.category] ?? { bg: "#2F6B5D", fg: "#FAF8F3" };

  return (
    <div
      className={`writing-card${writing ? " is-writing" : ""}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      tabIndex={0}
      role="img"
      aria-label="כרטיס מתכון מצויר">
      {/* the two cards standing behind, showing only their tabs */}
      <span className="writing-card__filed writing-card__filed--back">
        <span className="writing-card__filed-tab">DESSERTS</span>
      </span>
      <span className="writing-card__filed writing-card__filed--mid">
        <span className="writing-card__filed-tab">MAINS</span>
      </span>

      {/* the card in front, leaning out — keyed so each pass replays */}
      <article className="writing-card__sheet" key={i}>
        <span
          className="writing-card__tab"
          style={{ background: tone.bg, color: tone.fg }}>
          {card.category}
        </span>

        <p className="writing-card__eyebrow">RECIPE</p>
        <span className="writing-card__flourish" aria-hidden="true">
          <i /><b /><i />
        </span>

        <div className="writing-card__line">
          <span className="writing-card__label">TITLE</span>
          <span className="writing-card__written writing-card__written--title">
            {card.title}
          </span>
        </div>
        <div className="writing-card__line writing-card__line--last">
          <span className="writing-card__label">SERVES</span>
          <span className="writing-card__written">
            {card.serves}
            {card.minutes > 0 && ` · ${card.minutes} min`}
          </span>
        </div>

        <span className="writing-card__leaf" aria-hidden="true" />
      </article>

      {/* the ceramic box, drawn in front so the cards sit inside it */}
      <span className="writing-card__box" aria-hidden="true" />
    </div>
  );
}
