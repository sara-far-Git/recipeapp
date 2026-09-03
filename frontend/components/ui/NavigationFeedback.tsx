"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationFeedback() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [navigating, setNavigating] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      startedAt.current = Date.now();
      setNavigating(true);
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, []);

  useEffect(() => {
    if (!navigating) return;
    const elapsed = Date.now() - startedAt.current;
    const timer = window.setTimeout(() => setNavigating(false), Math.max(0, 220 - elapsed));
    return () => window.clearTimeout(timer);
  }, [pathname, search, navigating]);

  return (
    <div className={`route-progress${navigating ? " is-active" : ""}`} aria-label="טעינת עמוד" aria-live="polite">
      <span />
      <i aria-hidden="true" />
      <b aria-hidden="true">פותחים את הדף</b>
    </div>
  );
}
