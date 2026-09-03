"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "logo-intro-v13";

function unlock() {
  const html = document.documentElement;
  html.classList.remove("logo-intro");
  html.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
}

function introSrc() {
  const ua = navigator.userAgent;
  const isApple = /iPhone|iPad|iPod/i.test(ua) || (/Safari/i.test(ua) && !/Chrome|CriOS|Edg|Android/i.test(ua));
  return isApple ? "/logo-intro.mp4" : "/logo-intro.webm";
}

export default function LogoIntro() {
  const [gone, setGone] = useState(false);
  const [hole, setHole] = useState(0);
  const [src, setSrc] = useState("");
  const [cue, setCue] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const phase = useRef<"play" | "reveal" | "done">("play");
  const progress = useRef(0);
  const detach = useRef(() => {});
  const startReveal = useRef(() => {});

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.scrollY > 48 || sessionStorage.getItem(KEY) === "1") {
      unlock();
      setGone(true);
      return;
    }

    document.documentElement.classList.add("logo-intro");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    setSrc(introSrc());

    const complete = () => {
      if (phase.current === "done") return;
      phase.current = "done";
      detach.current();
      sessionStorage.setItem(KEY, "1");
      unlock();
      setGone(true);
    };

    const openReveal = () => {
      if (phase.current !== "play") return;
      phase.current = "reveal";
      setCue(true);
    };
    startReveal.current = openReveal;

    const apply = (next: number) => {
      progress.current = Math.min(1, Math.max(0, next));
      setHole(progress.current * 150);
      if (progress.current >= 0.995) complete();
    };

    const fallback = window.setTimeout(openReveal, 8000);
    const onWheel = (event: WheelEvent) => {
      if (phase.current === "done") return;
      event.preventDefault();
      if (phase.current === "reveal") apply(progress.current + event.deltaY / (window.innerHeight * 2.1));
    };
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
    const onTouchMove = (event: TouchEvent) => {
      if (phase.current === "done") return;
      event.preventDefault();
      if (phase.current !== "reveal") return;
      const nextY = event.touches[0]?.clientY ?? touchY;
      apply(progress.current + (touchY - nextY) / (window.innerHeight * 1.8));
      touchY = nextY;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return complete();
      if (phase.current !== "reveal") return;
      if (event.key === "ArrowDown" || event.key === " " || event.key === "PageDown") {
        event.preventDefault();
        apply(progress.current + 0.085);
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
      window.clearTimeout(fallback);
      detach.current();
      if (phase.current !== "done") unlock();
    };
  }, []);

  if (gone) return null;

  const cueOn = cue && hole < 18;
  const veilMask = hole > 0
    ? `radial-gradient(circle at 50% 50%, transparent ${hole}%, #000 calc(${hole}% + 0.8px))`
    : "none";

  return (
    <div
      className="logo-intro-veil"
      aria-hidden="true"
      style={{
        ["--hole" as string]: `${hole}%`,
        opacity: hole > 132 ? 0 : 1,
        WebkitMaskImage: veilMask,
        maskImage: veilMask,
      }}
    >
      <div className="logo-intro-mark" style={{ opacity: 1 - Math.min(1, hole / 90) }}>
        <img className="logo-intro-poster" src="/logo-transparent.png" alt="" style={{ opacity: videoReady ? 0 : 1 }} />
        <video
          className="logo-intro-video"
          src={src || "/logo-intro.webm"}
          muted
          playsInline
          preload="auto"
          autoPlay
          style={{ opacity: videoReady ? 1 : 0 }}
          onPlaying={() => setVideoReady(true)}
          onEnded={() => startReveal.current()}
          onError={() => startReveal.current()}
        />
      </div>
      <p className={cueOn ? "logo-intro-cue is-on" : "logo-intro-cue"} style={{ opacity: cueOn ? 1 - hole / 18 : 0 }}>
        <span>גללו לכניסה</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </p>
    </div>
  );
}
