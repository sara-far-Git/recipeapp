"use client";

/**
 * A full-screen layer, rendered straight onto <body>.
 *
 * `position: fixed` is measured against the viewport only while no ancestor
 * creates a containing block for it — and a transform, filter, backdrop-filter,
 * perspective, contain or will-change anywhere above is enough to do that. Any
 * of those can appear later, in an animation or a new wrapper, and the layer
 * silently starts positioning against that ancestor instead: it lands wherever
 * that element sits in the page, which for a long page means below the fold.
 *
 * Rendering through a portal takes the layer out of that chain entirely, so it
 * cannot happen.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export default function Overlay({
  children,
  className,
  style,
  /** Set when the layer holds a dialog rather than a status message. */
  role = "status",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  role?: "status" | "dialog";
  label?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  /* A dialog keeps the keyboard inside it while it is open, and hands focus
     back to whatever opened it when it closes — otherwise Tab wanders into
     the page behind, and closing drops the reader at the top of the page. */
  useEffect(() => {
    if (role !== "dialog" || !mounted) return;
    const opener = document.activeElement as HTMLElement | null;
    // Move in, unless the dialog already chose where focus goes.
    const firstFocus = window.setTimeout(() => {
      const layer = layerRef.current;
      if (!layer || layer.contains(document.activeElement)) return;
      layer.querySelector<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea, select')?.focus();
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !layerRef.current) return;
      const items = Array.from(layerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = layerRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(firstFocus);
      document.removeEventListener("keydown", onKey);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [role, mounted]);

  // The page scrolling under a full-screen layer is its own small bug.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={layerRef}
      className={cn("fixed inset-0 z-[200] flex items-center justify-center", className)}
      style={style}
      role={role}
      aria-live={role === "status" ? "polite" : undefined}
      aria-modal={role === "dialog" ? true : undefined}
      aria-label={label}>
      {children}
    </div>,
    document.body,
  );
}
