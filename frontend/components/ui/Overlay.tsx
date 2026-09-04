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
import { useEffect, useState } from "react";
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
  useEffect(() => setMounted(true), []);

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
