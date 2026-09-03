/**
 * The site's illustration mark: a recipe box with three cards rising out of
 * it and a sprig on the front. Every category is the same box — only the
 * glyph on the front card changes — so the six read as one family wherever
 * they appear. Drawn in the same single-weight line as the pot loader and
 * the leaf, in `currentColor`, with the sprig and strap in the terracotta
 * accent; it takes the colour of whatever panel it sits on.
 *
 * `animated` lifts the cards in a stagger on hover of the nearest `.group`
 * (and once when the icon scrolls into view); reduced-motion users get the
 * still version.
 */
import { cn } from "@/lib/utils";

export type RecipeIconKind =
  | "ראשונות"
  | "עיקריות"
  | "מאפים"
  | "קינוחים"
  | "סלטים"
  | "משקאות"
  | "book";

const ACCENT = "var(--icon-accent, #D97757)";

/** Front-card glyphs, each fitting a 22×16 box centred at (32, 24). */
const GLYPHS: Record<Exclude<RecipeIconKind, "book">, JSX.Element> = {
  // shallow bowl with a spoon resting in it
  ראשונות: (
    <g>
      <path d="M23 24h18c0 5-4 8-9 8s-9-3-9-8z" />
      <path d="M21 24h22" />
      <path d="M36 19l5-5" />
    </g>
  ),
  // cloche
  עיקריות: (
    <g>
      <path d="M23 29c0-6 4-10 9-10s9 4 9 10" />
      <path d="M21 29h22" />
      <path d="M32 19v-2.5" />
      <circle cx="32" cy="15" r="1.4" />
    </g>
  ),
  // loaf with three scores
  מאפים: (
    <g>
      <path d="M23 25c0-4 3-7 9-7s9 3 9 7v5H23v-5z" />
      <path d="M27 21l2 3M31 20l2 3M35 21l2 3" />
    </g>
  ),
  // slice of cake with a cherry
  קינוחים: (
    <g>
      <path d="M24 30V23l8-6 8 6v7" />
      <path d="M24 26h16" />
      <circle cx="32" cy="14.5" r="1.6" stroke={ACCENT} />
    </g>
  ),
  // leaf
  סלטים: (
    <g>
      <path d="M25 30c0-8 5-13 14-13-1 8-6 13-14 13z" />
      <path d="M25 30c3-4 6-7 10-9" />
    </g>
  ),
  // cup with steam
  משקאות: (
    <g>
      <path d="M24 21h14v6c0 3-2 5-5 5h-4c-3 0-5-2-5-5v-6z" />
      <path d="M38 23h2c1.7 0 3 1.3 3 3s-1.3 3-3 3h-2" />
      <path d="M29 18c0-2 1-2.5 1-4M33 18c0-2 1-2.5 1-4" stroke={ACCENT} />
    </g>
  ),
};

export function normalizeIconKind(category?: string | null): RecipeIconKind {
  return category && category in GLYPHS ? (category as RecipeIconKind) : "book";
}

export default function RecipeIcon({
  category,
  className,
  animated = true,
  title,
}: {
  category?: string | null;
  className?: string;
  animated?: boolean;
  /** Accessible name; omit when the icon is decorative next to a label. */
  title?: string;
}) {
  const kind = normalizeIconKind(category);
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("recipe-icon", animated && "recipe-icon--live", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}

      {/* three cards, back to front — the stagger lifts them in this order */}
      <g className="recipe-icon__card recipe-icon__card--3">
        <rect x="19" y="14" width="26" height="24" rx="2.5" />
      </g>
      <g className="recipe-icon__card recipe-icon__card--2">
        <rect x="16.5" y="18" width="31" height="24" rx="2.5" />
      </g>
      <g className="recipe-icon__card recipe-icon__card--1">
        <rect x="14" y="22" width="36" height="24" rx="2.5" />
        {kind === "book" ? (
          <path d="M22 30h20M22 35h14" />
        ) : (
          <g transform="translate(0 6)">{GLYPHS[kind]}</g>
        )}
      </g>

      {/* the box: front face, lip, and the strap that closes it */}
      <path d="M10 40h44v11a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V40z" fill="var(--icon-fill, transparent)" />
      <path d="M8 40h48" />
      <path d="M29 40v4.5a3 3 0 0 0 6 0V40" stroke={ACCENT} />

      {/* sprig on the front */}
      <g className="recipe-icon__sprig" stroke={ACCENT}>
        <path d="M17 51c0-3.2 1.8-5.3 5-5.3-.2 3.2-2 5.3-5 5.3z" />
        <path d="M17 51c1-1.6 2.2-2.8 3.7-3.6" />
      </g>
    </svg>
  );
}
