"use client";

/**
 * A confirmation the site draws itself.
 *
 * `window.confirm` was doing this job: a grey browser box in the wrong
 * language for the design, which some browsers throttle or suppress outright
 * — and when it is suppressed the answer is "no", so the button simply stops
 * working with nothing to see.
 *
 * The destructive choice is never the one focused on open, and Escape or a
 * click outside both mean no.
 */
import { useEffect, useRef } from "react";
import Overlay from "@/components/ui/Overlay";

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "ביטול",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // The safe choice takes the focus, so a stray Enter cannot delete anything.
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <Overlay role="dialog" label={title} className="p-5">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(11, 42, 32, 0.62)" }}
        onClick={busy ? undefined : onCancel}
      />
      <div
        className="card-surface relative w-full max-w-sm p-6 text-center animate-fade-up"
        role="document">
        <h2 className="section-title text-bark-500 mb-2">{title}</h2>
        {body && <p className="text-bark-300 text-sm leading-relaxed mb-6">{body}</p>}
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 btn-outline h-12 min-h-0 text-sm disabled:opacity-40">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 h-12 min-h-0 text-sm font-bold text-white disabled:opacity-40"
            style={{ background: "#B3452B", borderRadius: 999 }}>
            {busy ? "רגע…" : confirmLabel}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
