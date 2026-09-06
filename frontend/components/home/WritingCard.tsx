"use client";

/**
 * The hero's mark: a scatter of recipe cards that gathers itself into the box.
 *
 * The panel opens with cards strewn across it — the state the site exists to
 * fix — and within about two seconds they sweep in and settle into the box,
 * tabs aligning, the front card last. That story plays on its own, because a
 * mark that only works if you drag it is a mark most visitors never see. The
 * dragging is still there for anyone who tries it: pull the front card out and
 * it springs back into the stack.
 *
 * The card render leaves its TITLE and SERVES rules empty, so the handwriting
 * is real text placed on top of them — rotated to -7.5deg, the angle those
 * rules run at in the render.
 */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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

/* Where each card comes in from, and where it settles. The starts are far
   enough out — several times the box's own width — to read as "spread across
   the panel" rather than "just outside the frame". The rests are the small
   offsets that make a stack look handled rather than machined. */
type Flight = { gx: string; gy: string; gr: string; rx: string; ry: string; rr: string };

const FLIGHTS: Flight[] = [
  { gx: "-70%", gy: "-60%", gr: "-24deg", rx: "-7%", ry: "-3%", rr: "-6deg" },
  { gx: "30%", gy: "-95%", gr: "17deg", rx: "-4%", ry: "-5%", rr: "-3deg" },
  { gx: "150%", gy: "-80%", gr: "-11deg", rx: "-1%", ry: "-6%", rr: "1deg" },
  { gx: "285%", gy: "-40%", gr: "22deg", rx: "2%", ry: "-5%", rr: "4deg" },
  { gx: "400%", gy: "35%", gr: "-19deg", rx: "5%", ry: "-3%", rr: "7deg" },
  { gx: "300%", gy: "140%", gr: "13deg", rx: "3%", ry: "-1%", rr: "3deg" },
  { gx: "120%", gy: "175%", gr: "-27deg", rx: "0%", ry: "0%", rr: "-2deg" },
  { gx: "-55%", gy: "120%", gr: "9deg", rx: "-3%", ry: "-1%", rr: "-5deg" },
];

/* One tone per card, borrowed from the divider tabs. */
const TONES = ["a", "b", "c", "a", "c", "b", "a", "c"];

export default function WritingCard() {
  const [i, setI] = useState(0);
  const [writing, setWriting] = useState(false);
  const [gathered, setGathered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  const startCycle = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(
      () => setI((n) => (n + 1) % CARDS.length),
      STEP_MS,
    );
  }, []);

  /* Runs on its own. Reduced motion keeps the cards gathered and never cycles. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGathered(true);
      return;
    }
    setWriting(true);
    // The writing only starts once the stack has landed.
    const settle = window.setTimeout(() => {
      setGathered(true);
      startCycle();
    }, 2100);
    return () => {
      window.clearTimeout(settle);
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [startCycle]);

  /* Pull the front card out of the box; let go and it drops back in. The
     cycle pauses while a hand is on it, so the card does not change mid-pull. */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gathered) return;
    const el = frontRef.current;
    if (!el) return;
    // A refused capture must not take the whole drag down with it.
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    const originX = e.clientX;
    const originY = e.clientY;
    setDragging(true);
    if (timer.current) window.clearInterval(timer.current);

    const move = (ev: PointerEvent) => {
      el.style.setProperty("--drag-x", `${ev.clientX - originX}px`);
      // Lifting reads better than sinking, so downward drag is damped.
      const dy = ev.clientY - originY;
      el.style.setProperty("--drag-y", `${dy < 0 ? dy : dy * 0.35}px`);
      el.style.setProperty("--drag-r", `${(ev.clientX - originX) * 0.02}deg`);
    };
    const up = () => {
      el.style.removeProperty("--drag-x");
      el.style.removeProperty("--drag-y");
      el.style.removeProperty("--drag-r");
      setDragging(false);
      startCycle();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const card = CARDS[i];

  return (
    <div
      className={`writing-card${writing ? " is-writing" : ""}${
        gathered ? " is-gathered" : ""
      }${dragging ? " is-dragging" : ""}`}
      role="img"
      aria-label="קופסת מתכונים שהכרטיסים נאספים לתוכה">
      {/* the scatter that gathers — drawn, not photographed, because this is
          the first thing the page paints */}
      <div className="gather-field" aria-hidden="true">
        {FLIGHTS.map((f, n) => (
          <span
            key={n}
            className={`gather-card gather-card--${TONES[n]}`}
            style={
              {
                "--gx": f.gx,
                "--gy": f.gy,
                "--gr": f.gr,
                "--rx": f.rx,
                "--ry": f.ry,
                "--rr": f.rr,
                "--gd": `${n * 95}ms`,
              } as React.CSSProperties
            }>
            <i />
            <i />
            <i />
          </span>
        ))}
      </div>

      <Image
        src="/marks/card-dividers.png"
        alt=""
        aria-hidden="true"
        width={1205}
        height={1215}
        className="writing-card__dividers"
      />

      <div
        className="writing-card__front"
        ref={frontRef}
        onPointerDown={onPointerDown}
        key={i}>
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
