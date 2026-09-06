"use client";

/**
 * A short explanation that appears over a control.
 *
 * Shown on hover and on keyboard focus, so it is not something only a mouse
 * can reach, and tied to the control with `aria-describedby` so a screen
 * reader reads it as the control's description rather than as loose text.
 *
 * It is an explanation, never the only place something is said: a control
 * still needs its own label. Touch has no hover, so nothing here may be the
 * only way to understand what a button does.
 */
import { cloneElement, isValidElement, useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** One sentence. Longer than that belongs on the page, not in a bubble. */
  text: string;
  /** Above by default; below when the control sits near the top of the page. */
  place?: "top" | "bottom";
  children: React.ReactNode;
  className?: string;
};

export default function Tip({ text, place = "top", children, className }: Props) {
  const id = useId();

  /* Point the control itself at the description where we can, rather than
     leaving the bubble as text floating beside it. */
  const described =
    isValidElement(children) && !(children.props as Record<string, unknown>)["aria-describedby"]
      ? cloneElement(children as React.ReactElement, { "aria-describedby": id })
      : children;

  return (
    <span className={cn("tip", `tip--${place}`, className)}>
      {described}
      <span role="tooltip" id={id} className="tip__bubble">
        {text}
      </span>
    </span>
  );
}
