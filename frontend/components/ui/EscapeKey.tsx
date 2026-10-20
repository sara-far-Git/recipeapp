"use client";

import { useEffect } from "react";

/** Escape closes whatever layer renders this — the keyboard's way out of a dialog. */
export default function EscapeKey({ onEscape }: { onEscape: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onEscape(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);
  return null;
}
