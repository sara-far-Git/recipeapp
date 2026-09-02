"use client";

import { useEffect } from "react";

function unlock() {
  const html = document.documentElement;
  html.classList.remove("logo-intro");
  html.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
}

export default function LogoIntro() {
  useEffect(() => {
    unlock();
  }, []);

  return null;
}
