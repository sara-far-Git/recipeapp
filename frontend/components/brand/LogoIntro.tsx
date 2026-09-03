"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "logo-intro-v14";
const EXIT_DURATION_MS = 420;
const MAX_INTRO_DURATION_MS = 4600;

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
  const [src, setSrc] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const finished = useRef(false);
  const completeRef = useRef<() => void>(() => {});

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const localPreview = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (localPreview || reduced || window.scrollY > 48 || sessionStorage.getItem(KEY) === "1") {
      unlock();
      setGone(true);
      return;
    }

    document.documentElement.classList.add("logo-intro");
    setSrc(introSrc());

    const complete = () => {
      if (finished.current) return;
      finished.current = true;
      sessionStorage.setItem(KEY, "1");
      unlock();
      setLeaving(true);
      window.setTimeout(() => setGone(true), EXIT_DURATION_MS);
    };
    completeRef.current = complete;

    const fallback = window.setTimeout(complete, MAX_INTRO_DURATION_MS);
    const skip = () => complete();
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchstart", skip, { passive: true, once: true });
    window.addEventListener("keydown", skip, { once: true });

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
      completeRef.current = () => {};
      if (!finished.current) unlock();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`logo-intro-veil${leaving ? " is-leaving" : ""}`}
      aria-hidden="true"
    >
      <div className="logo-intro-mark">
        <p className="logo-intro-wordmark" style={{ opacity: videoReady ? 0 : 1 }}>
          RECIPE<br />SPACE
        </p>
        <video
          className="logo-intro-video"
          src={src || "/logo-intro.webm"}
          muted
          playsInline
          preload="auto"
          autoPlay
          style={{ opacity: videoReady ? 1 : 0 }}
          onCanPlay={(event) => { event.currentTarget.play().catch(() => {}); }}
          onPlaying={() => setVideoReady(true)}
          onEnded={() => completeRef.current()}
          onError={() => completeRef.current()}
        />
      </div>
    </div>
  );
}
