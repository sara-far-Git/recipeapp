"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "logo-intro-video";

function unlock() {
  const html = document.documentElement;
  html.classList.remove("logo-intro");
  html.style.overflow = "";
}

export default function LogoIntro() {
  const [gone, setGone] = useState(false);
  const [fade, setFade] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.scrollY > 48 || sessionStorage.getItem(KEY) === "1") {
      unlock();
      setGone(true);
      return;
    }

    html.classList.add("logo-intro");

    const finish = () => {
      if (done.current) return;
      done.current = true;
      sessionStorage.setItem(KEY, "1");
      setFade(true);
      window.setTimeout(() => {
        unlock();
        setGone(true);
      }, 420);
    };

    let canSkip = false;
    const arm = window.setTimeout(() => {
      canSkip = true;
    }, 800);
    const onSkip = (e: Event) => {
      if (!canSkip) return;
      if (e instanceof KeyboardEvent && e.key !== "Escape" && e.key !== "Enter" && e.key !== " ") return;
      finish();
    };

    const failsafe = window.setTimeout(finish, 10000);
    window.addEventListener("wheel", onSkip, { passive: true });
    window.addEventListener("touchstart", onSkip, { passive: true });
    window.addEventListener("keydown", onSkip);

    return () => {
      window.clearTimeout(failsafe);
      window.clearTimeout(arm);
      window.removeEventListener("wheel", onSkip);
      window.removeEventListener("touchstart", onSkip);
      window.removeEventListener("keydown", onSkip);
      if (!done.current) unlock();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className="logo-intro-veil"
      aria-hidden="true"
      style={{
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? "none" : "auto",
      }}
    >
      <div className="logo-intro-mark">
        <video
          className="logo-intro-video"
          src="/logo-intro.mp4"
          muted
          playsInline
          preload="auto"
          autoPlay
          onEnded={() => {
            if (done.current) return;
            done.current = true;
            sessionStorage.setItem(KEY, "1");
            setFade(true);
            window.setTimeout(() => {
              unlock();
              setGone(true);
            }, 420);
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
