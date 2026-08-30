"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Logo from "@/components/brand/Logo";

const KEY = "logo-intro";

export default function LogoIntro() {
  const [p, setP] = useState(0);
  const [gone, setGone] = useState(false);
  const pRef = useRef(0);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.scrollY > 48 || sessionStorage.getItem(KEY) === "1") {
      html.classList.remove("logo-intro");
      setGone(true);
      return;
    }

    html.classList.add("logo-intro");
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    let finished = false;
    const absorb = (e: WheelEvent) => {
      e.preventDefault();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      sessionStorage.setItem(KEY, "1");
      html.style.overflow = prevOverflow;
      html.classList.remove("logo-intro");
      window.addEventListener("wheel", absorb, { passive: false });
      window.setTimeout(() => window.removeEventListener("wheel", absorb), 480);
      setGone(true);
    };

    const apply = (next: number) => {
      pRef.current = Math.min(1, Math.max(0, next));
      setP(pRef.current);
      if (pRef.current >= 0.995) finish();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      apply(pRef.current + e.deltaY / (window.innerHeight * 0.85));
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      apply(pRef.current + (touchY - y) / (window.innerHeight * 0.7));
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        apply(pRef.current + 0.18);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      html.classList.remove("logo-intro");
    };
  }, []);

  if (gone) return null;

  const hole = Math.max(0, (p - 0.06) / 0.94) * 145;

  return (
    <div
      className="logo-intro-veil"
      aria-hidden="true"
      style={{
        ["--hole" as string]: `${hole}%`,
        opacity: p > 0.96 ? 0 : 1,
      }}
    >
      <div
        className="logo-intro-mark"
        style={{
          opacity: 1 - Math.min(1, p * 1.2),
          transform: `scale(${1 + p * 5.2})`,
        }}
      >
        <Logo size={480} priority className="w-[min(78vw,26rem)] h-auto" />
      </div>
    </div>
  );
}
