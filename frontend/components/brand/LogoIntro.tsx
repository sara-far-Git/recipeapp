"use client";

import { useEffect, useRef, useState } from "react";

// Bumped with the artwork: anyone mid-session has the old one marked seen.
const KEY = "logo-intro-v22";
const MAX_INTRO_DURATION_MS = 12000;

function unlock() {
  const html = document.documentElement;
  html.classList.remove("logo-intro");
  html.style.removeProperty("--intro-progress");
  html.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
}

function setProgress(value: number) {
  document.documentElement.style.setProperty("--intro-progress", String(value));
}

function introSrc() {
  const ua = navigator.userAgent;
  const isApple = /iPhone|iPad|iPod/i.test(ua) || (/Safari/i.test(ua) && !/Chrome|CriOS|Edg|Android/i.test(ua));
  return isApple ? "/logo-intro.mp4" : "/logo-intro.webm";
}

export default function LogoIntro() {
  // Keep the overlay out of the first paint. Otherwise every route transition
  // can flash the logo before the client decides this session should skip it.
  const [gone, setGone] = useState(true);
  const [src, setSrc] = useState("");
  const [showCue, setShowCue] = useState(false);
  const finished = useRef(false);
  const progress = useRef(0);
  const touchY = useRef<number | null>(null);
  const autoFrame = useRef(0);
  const animateHome = useRef<() => void>(() => {});

  useEffect(() => {
    // Direct links must reveal their own content, without an intro or redirect.
    if (window.location.pathname !== "/" || window.location.hash) {
      unlock();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forcePreview = new URLSearchParams(window.location.search).has("intro");
    if (reduced || window.scrollY > 48 || (!forcePreview && sessionStorage.getItem(KEY) === "1")) {
      unlock();
      return;
    }

    finished.current = false;
    progress.current = 0;
    document.documentElement.classList.add("logo-intro");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    setProgress(0);
    setGone(false);
    setSrc(introSrc());
    const cueTimer = window.setTimeout(() => setShowCue(true), 1400);

    const stopAuto = () => {
      if (autoFrame.current) cancelAnimationFrame(autoFrame.current);
      autoFrame.current = 0;
    };

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      stopAuto();
      detach();
      sessionStorage.setItem(KEY, "1");
      progress.current = 1;
      setProgress(1);
      window.setTimeout(() => {
        unlock();
        window.scrollTo(0, 0);
        setGone(true);
      }, 80);
    };

    const addProgress = (deltaPx: number) => {
      if (finished.current) return;
      const next = Math.min(1, Math.max(0, progress.current + deltaPx / (window.innerHeight * 0.88)));
      progress.current = next;
      setProgress(next);
      if (next >= 0.995) finish();
    };

    animateHome.current = () => {
      if (finished.current || autoFrame.current) return;
      const start = progress.current;
      const t0 = performance.now();
      const duration = 980 * (1 - start);
      const tick = (now: number) => {
        if (finished.current) return;
        const t = Math.min(1, (now - t0) / Math.max(duration, 1));
        const eased = 1 - (1 - t) ** 3;
        progress.current = start + (1 - start) * eased;
        setProgress(progress.current);
        if (t < 1) autoFrame.current = requestAnimationFrame(tick);
        else finish();
      };
      autoFrame.current = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      if (finished.current) return;
      event.preventDefault();
      stopAuto();
      addProgress(event.deltaY);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchY.current = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (finished.current || touchY.current == null) return;
      event.preventDefault();
      stopAuto();
      const y = event.touches[0].clientY;
      addProgress(touchY.current - y);
      touchY.current = y;
    };
    const onKey = (event: KeyboardEvent) => {
      if (finished.current) return;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " " || event.key === "Enter") {
        event.preventDefault();
        animateHome.current();
      }
    };

    const detach = () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    const fallback = window.setTimeout(() => animateHome.current(), MAX_INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(cueTimer);
      window.clearTimeout(fallback);
      stopAuto();
      detach();
      animateHome.current = () => {};
      if (!finished.current) unlock();
    };
  }, []);

  if (gone) return null;

  return (
    <>
    <div className="logo-intro-veil" aria-hidden="true">
      <div className="logo-intro-stage">
        <div className="logo-intro-mark">
          <video
            className="logo-intro-video"
            src={src || "/logo-intro.webm"}
            muted
            playsInline
            preload="auto"
            autoPlay
            onCanPlay={(event) => { event.currentTarget.play().catch(() => setShowCue(true)); }}
            onEnded={() => setShowCue(true)}
            onError={() => {
              setShowCue(true);
              window.setTimeout(() => {
                if (!finished.current && progress.current < 0.08) animateHome.current();
              }, 700);
            }}
          />
        </div>
      </div>
    </div>
      <p className={`logo-intro-cue${showCue ? " is-on" : ""}`} style={{ opacity: showCue ? 1 : 0 }}>
        <span>גללי למטה</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </p>
    </>
  );
}
