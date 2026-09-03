/**
 * The rest of the family. `RecipeIcon` is the mark for a recipe itself; these
 * are the marks for everything around it — the places a page opens on, and
 * the attributes a recipe carries. Same 64-grid, same single 1.5 line, same
 * rule: the drawing is `currentColor`, one detail per icon is the terracotta
 * accent, so it reads on cream and on green alike.
 *
 * Marks (large, for heroes and empty states):
 *   shopping · cooking · saved · pantry · profile · new · voice · missing ·
 *   install · pro
 * Attributes (small, next to a recipe's facts):
 *   meat · dairy · pareve · easy · medium · hard · time · servings
 */
import { cn } from "@/lib/utils";

const A = "var(--icon-accent, #D97757)";

export type SiteIconName =
  | "shopping" | "cooking" | "saved" | "pantry" | "profile" | "new" | "voice"
  | "missing" | "install" | "pro"
  | "meat" | "dairy" | "pareve" | "easy" | "medium" | "hard" | "time" | "servings";

/* A few pieces recur — the box and the pot — so every mark that uses them is
   the same object, not a redrawing. */
const BOX = (
  <>
    <path d="M10 40h44v11a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V40z" />
    <path d="M8 40h48" />
  </>
);
const SPRIG = (
  <g stroke={A}>
    <path d="M17 51c0-3.2 1.8-5.3 5-5.3-.2 3.2-2 5.3-5 5.3z" />
    <path d="M17 51c1-1.6 2.2-2.8 3.7-3.6" />
  </g>
);
const POT_SMALL = (
  <>
    <path d="M18 34h28v10a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5V34z" />
    <path d="M15 34h34" />
  </>
);
const steam = (xs: number[]) => (
  <g stroke={A}>
    {xs.map((x) => <path key={x} d={`M${x} 28c0-2 1-2.5 1-4.5`} />)}
  </g>
);

const ICONS: Record<SiteIconName, JSX.Element> = {
  // ── marks ────────────────────────────────────────────────────────────
  shopping: (
    <>
      <path d="M20 30c0-8 5-14 12-14s12 6 12 14" />
      <path d="M14 30h36l-3.5 19a3 3 0 0 1-3 2.5H20.5a3 3 0 0 1-3-2.5L14 30z" />
      <path d="M22 37h20M23.5 43h17" />
      <g stroke={A}>
        <path d="M41 26c0-5 3-8 8-8-.3 5-3 8-8 8z" />
        <path d="M41 26c1.5-2.5 3.5-4.5 6-6" />
      </g>
    </>
  ),
  cooking: (
    <>
      <path d="M14 30h36v14a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V30z" />
      <path d="M11 30h42M8 34h4M52 34h4" />
      <path d="M17 30c0-4 6.5-6 15-6s15 2 15 6" />
      <path d="M32 21v3" />
      <circle cx="32" cy="19" r="1.6" />
      {steam([26, 32, 38].map((x) => x - 0.5))}
    </>
  ),
  saved: (
    <>
      <rect x="16" y="22" width="32" height="24" rx="2.5" />
      {BOX}
      <path d="M28 22v16l4-3 4 3V22" stroke={A} />
    </>
  ),
  pantry: (
    <>
      <path d="M20 24h24v24a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V24z" />
      <path d="M22 24v-4h20v4M19 20h26" />
      <rect x="25" y="32" width="14" height="9" rx="1.5" />
      <g stroke={A}>
        <path d="M44 31c0-4 2.5-6.5 6-6.5-.2 4-2.5 6.5-6 6.5z" />
        <path d="M44 31c1.2-2 2.8-3.6 4.8-4.7" />
      </g>
    </>
  ),
  profile: (
    <>
      <circle cx="32" cy="34" r="13" />
      <circle cx="32" cy="34" r="7.5" />
      <path d="M13.5 20v30M10.5 20v8a3 3 0 0 0 6 0v-8" />
      <path d="M50.5 20c3 3 3 9 0 14v16" stroke={A} />
    </>
  ),
  new: (
    <>
      <rect x="14" y="16" width="30" height="36" rx="2.5" />
      <path d="M21 26h16M21 32h12" />
      <path d="M35 47l11-11 4 4-11 11-4.5.5.5-4.5z" stroke={A} />
    </>
  ),
  voice: (
    <>
      <rect x="14" y="16" width="30" height="36" rx="2.5" />
      <rect x="25" y="24" width="8" height="13" rx="4" />
      <path d="M21 34c0 4.4 3.6 8 8 8s8-3.6 8-8M29 42v5" />
      <path d="M46 28c2 2 2 6 0 8M50 24c4 4 4 12 0 16" stroke={A} />
    </>
  ),
  missing: (
    <>
      {BOX}
      <path d="M12 40l-2-13 42-4 2 17" />
      <path d="M30 30h4" stroke={A} />
      {SPRIG}
    </>
  ),
  install: (
    <>
      <rect x="18" y="10" width="28" height="44" rx="4" />
      <path d="M28 15h8" />
      <circle cx="32" cy="49" r="1.4" />
      <rect x="27" y="24" width="10" height="10" rx="1.5" />
      <path d="M23 34h18v6a2 2 0 0 1-2 2H25a2 2 0 0 1-2-2v-6zM22 34h20" />
      <path d="M30 34v2a2 2 0 0 0 4 0v-2" stroke={A} />
    </>
  ),
  pro: (
    <>
      <rect x="16" y="22" width="32" height="24" rx="2.5" />
      {BOX}
      <path d="M32 12l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" stroke={A} />
    </>
  ),

  // ── attributes ────────────────────────────────────────────────────────
  meat: (
    <>
      <circle cx="32" cy="34" r="13" />
      <g stroke={A}>
        <path d="M25 41l8-8" />
        <path d="M33 33a4 4 0 1 1 3 3" />
      </g>
    </>
  ),
  dairy: (
    <>
      <path d="M24 22h14l4 6v20a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V28l2-6z" />
      <path d="M42 32h4a3 3 0 0 1 0 6h-4" />
      <path d="M25 37c3-2 6-2 9 0s6 2 9 0" stroke={A} />
    </>
  ),
  pareve: (
    <>
      <path d="M22 44c0-12 7-20 20-20-1 12-8 20-20 20z" />
      <path d="M22 44c4-6 8-11 14-15" stroke={A} />
    </>
  ),
  easy: (
    <>
      {POT_SMALL}
      {steam([32])}
    </>
  ),
  medium: (
    <>
      {POT_SMALL}
      {steam([27.5, 36.5])}
    </>
  ),
  hard: (
    <>
      {POT_SMALL}
      {steam([25, 32, 39])}
    </>
  ),
  time: (
    <>
      <circle cx="32" cy="36" r="14" />
      <path d="M28 18h8M32 18v4" />
      <path d="M32 36v-8" stroke={A} />
      <path d="M32 36l5.5 3.5" />
    </>
  ),
  servings: (
    <>
      <circle cx="25" cy="36" r="11" />
      <circle cx="41" cy="36" r="11" />
      <circle cx="25" cy="36" r="5" stroke={A} />
    </>
  ),
};

export default function SiteIcon({
  name,
  className,
  title,
}: {
  name: SiteIconName;
  className?: string;
  /** Accessible name; omit when the icon is decorative next to a label. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("recipe-icon", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {ICONS[name]}
    </svg>
  );
}

/** Attribute values as the API sends them, mapped to the glyph that shows them. */
export const KOSHER_ICON: Record<string, SiteIconName> = { meat: "meat", dairy: "dairy", pareve: "pareve" };
export const DIFFICULTY_ICON: Record<string, SiteIconName> = { easy: "easy", medium: "medium", hard: "hard" };
