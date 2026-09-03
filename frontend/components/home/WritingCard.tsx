"use client";

/**
 * The hero's mark, built from the three renders: the tabbed dividers behind,
 * the blank recipe card in front, and the ceramic box laid over their feet.
 *
 * The card render leaves its TITLE and SERVES rules empty, so the handwriting
 * is real text placed on top of them — rotated to -7.5deg, the angle those
 * rules run at in the render. It rests still until the pointer arrives; then
 * the card rises and writes, and each further pass brings the next name.
 */
import Image from "next/image";
import { useEffect, useState } from "react";

type Sample = { title: string; serves: string };

/* Decoration, not information: nobody is meant to read the card, and the
   script face carries no Hebrew. */
/* Short enough to sit inside the rule without running off the paper. */
const CARDS: Sample[] = [
  { title: "Lemon Thyme Chicken", serves: "4 · 55 min" },
  { title: "Dulce de Leche Cake", serves: "12 · 70 min" },
  { title: "Rustic Loaf", serves: "8 · 80 min" },
  { title: "Garden Herb Salad", serves: "4 · 12 min" },
  { title: "Grapefruit Cooler", serves: "6 · 8 min" },
  { title: "Roasted Root Soup", serves: "6 · 45 min" },
];

const STEP_MS = 3800;

export default function WritingCard() {
  const [i, setI] = useState(0);
  const [writing, setWriting] = useState(false);

  /* Runs on its own. Reduced-motion keeps the first card and never cycles. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setWriting(true);
    const t = window.setInterval(
      () => setI((n) => (n + 1) % CARDS.length),
      STEP_MS,
    );
    return () => window.clearInterval(t);
  }, []);

  const card = CARDS[i];

  return (
    <div
      className={`writing-card${writing ? " is-writing" : ""}`}
      role="img"
      aria-label="קופסת מתכונים עם כרטיסים">
      <Image
        src="/marks/card-dividers.png"
        alt=""
        aria-hidden="true"
        width={1205}
        height={1215}
        className="writing-card__dividers"
      />

      <div className="writing-card__front" key={i}>
        <Image
          src="/marks/card-front.png"
          alt=""
          aria-hidden="true"
          width={1206}
          height={1116}
          priority
          className="writing-card__paper"
        />
        {/* laid on the render's own empty rules */}
        <span className="writing-card__ink writing-card__ink--title">
          {card.title}
        </span>
        <span className="writing-card__ink writing-card__ink--serves">
          {card.serves}
        </span>
      </div>

      {/* only the front wall, so the cards really are behind it */}
      <Image
        src="/marks/box-front.png"
        alt=""
        aria-hidden="true"
        width={1171}
        height={1233}
        priority
        className="writing-card__box"
      />
    </div>
  );
}
