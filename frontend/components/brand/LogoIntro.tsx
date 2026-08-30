"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "logo-intro-v8";

const FRAMES = [
  "/logo-letters/01_RECIPE.png",
  "/logo-letters/02_RECIPE_S.png",
  "/logo-letters/03_RECIPE_SP.png",
  "/logo-letters/04_RECIPE_SPA.png",
  "/logo-letters/05_RECIPE_SPAC.png",
  "/logo-letters/06_RECIPE_SPACE.png",
];

function unlock() {
  const html = document.documentElement;
  html.classList.remove("logo-intro");
  html.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
}

export default function LogoIntro() {
  const [gone, setGone] = useState(false);
  const [hole, setHole] = useState(0);
  const [frame, setFrame] = useState(0);
  const phase = useRef<"play" | "reveal" | "done">("play");
  const p = useRef(0);
  const detach = useRef(() => {});

  useEffect(() => {
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.scrollY > 48 || sessionStorage.getItem(KEY) === "1") {
      unlock();
      setGone(true);
      return;
    }

    html.classList.add("logo-intro");
    FRAMES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    const complete = () => {
      if (phase.current === "done") return;
      phase.current = "done";
      detach.current();
      sessionStorage.setItem(KEY, "1");
      unlock();
      setGone(true);
    };

    const apply = (next: number) => {
      p.current = Math.min(1, Math.max(0, next));
      setHole(p.current * 150);
      if (p.current >= 0.995) complete();
    };

    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      if (i >= FRAMES.length) {
        window.clearInterval(tick);
        phase.current = "reveal";
        return;
      }
      setFrame(i);
    }, 220);

    const onWheel = (e: WheelEvent) => {
      if (phase.current === "done") return;
      e.preventDefault();
      if (phase.current !== "reveal") return;
      apply(p.current + e.deltaY / (window.innerHeight * 0.85));
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (phase.current === "done") return;
      e.preventDefault();
      if (phase.current !== "reveal") return;
      const y = e.touches[0].clientY;
      apply(p.current + (touchY - y) / (window.innerHeight * 0.7));
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (phase.current === "done") return;
      if (e.key === "Escape") {
        complete();
        return;
      }
      if (phase.current !== "reveal") return;
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        apply(p.current + 0.16);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    detach.current = () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };

    return () => {
      window.clearInterval(tick);
      detach.current();
      if (phase.current !== "done") unlock();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className="logo-intro-veil"
      aria-hidden="true"
      style={{
        ["--hole" as string]: `${hole}%`,
        opacity: hole > 132 ? 0 : 1,
        pointerEvents: "none",
      }}
    >
      <img
        className="logo-intro-frame"
        src={FRAMES[frame]}
        alt=""
        style={{ opacity: 1 - Math.min(1, hole / 90) }}
      />
    </div>
  );
}
