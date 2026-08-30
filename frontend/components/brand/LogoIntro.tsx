"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "logo-intro-v3";

function unlock() {
  const html = document.documentElement;
  html.classList.remove("logo-intro");
  html.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
}

export default function LogoIntro() {
  const [gone, setGone] = useState(false);
  const [hole, setHole] = useState(0);
  const phase = useRef<"video" | "reveal" | "done">("video");
  const raf = useRef(0);
  const startReveal = useRef(() => {});
  const videoEnded = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.scrollY > 48 || sessionStorage.getItem(KEY) === "1") {
      unlock();
      setGone(true);
      return;
    }

    html.classList.add("logo-intro");

    const complete = () => {
      if (phase.current === "done") return;
      phase.current = "done";
      if (raf.current) cancelAnimationFrame(raf.current);
      sessionStorage.setItem(KEY, "1");
      unlock();
      setGone(true);
    };

    startReveal.current = () => {
      if (phase.current !== "video") return;
      phase.current = "reveal";
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1100);
        const eased = 1 - (1 - t) ** 3;
        setHole(eased * 150);
        if (t < 1) raf.current = requestAnimationFrame(tick);
        else complete();
      };
      raf.current = requestAnimationFrame(tick);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") startReveal.current();
    };
    window.addEventListener("keydown", onKey);
    const stuck = window.setTimeout(() => startReveal.current(), 8000);
    if (videoEnded.current) startReveal.current();

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(stuck);
      if (raf.current) cancelAnimationFrame(raf.current);
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
      }}
    >
      <div
        className="logo-intro-mark"
        style={{ opacity: 1 - Math.min(1, hole / 90) }}
      >
        <video
          className="logo-intro-video"
          src="/logo-intro.mp4"
          muted
          playsInline
          preload="auto"
          autoPlay
          onEnded={() => {
            videoEnded.current = true;
            startReveal.current();
          }}
          onError={() => {
            unlock();
            setGone(true);
          }}
        />
      </div>
    </div>
  );
}
