/**
 * The illustrated marks. Rendered 3D pieces on transparent ground, sized and
 * optimised by next/image — the source PNGs are ~1.5MB each and go out as
 * AVIF at the size actually shown.
 *
 * One place to swap art: change a file in /public/marks and every screen that
 * uses that name follows.
 */
import Image from "next/image";
import { cn } from "@/lib/utils";

export type MarkName =
  /** recipe box, cards fanned — the collection */
  | "collection"
  /** folder stack with a ribbon — saved recipes */
  | "saved"
  /** folders behind a magnifier and filter dials — search */
  | "search"
  /** a card with a rating, a heart and a comment — the community */
  | "community"
  /** the app open on a desktop — install */
  | "desktop";

const ALT: Record<MarkName, string> = {
  collection: "קופסת מתכונים ובתוכה כרטיסים",
  saved: "תיקיית מתכונים עם סימנייה",
  search: "זכוכית מגדלת מעל תיקיות מתכונים",
  community: "כרטיס מתכון עם דירוג ותגובות",
  desktop: "האתר פתוח על מסך מחשב",
};

export default function Mark({
  name,
  className,
  sizes = "160px",
  priority = false,
  decorative = false,
}: {
  name: MarkName;
  /** Sets the box; the mark fills it and keeps its proportions. */
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** True where nearby text already says the same thing. */
  decorative?: boolean;
}) {
  return (
    <span className={cn("relative block aspect-square", className)}>
      <Image
        src={`/marks/${name}.png`}
        alt={decorative ? "" : ALT[name]}
        aria-hidden={decorative || undefined}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
