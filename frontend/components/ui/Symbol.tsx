import { cn } from "@/lib/utils";

export type SymbolName =
  | "heart"
  | "chat"
  | "lens"
  | "filter"
  | "ribbon"
  | "pad"
  | "pen"
  | "card"
  | "box";

type SymbolProps = {
  name: SymbolName;
  className?: string;
  title?: string;
  decorative?: boolean;
};

const ALT: Record<SymbolName, string> = {
  heart: "אהבתי",
  chat: "שיתוף",
  lens: "חיפוש",
  filter: "סינון",
  ribbon: "שמורים",
  pad: "רשימת קניות",
  pen: "כתיבה",
  card: "מתכון",
  box: "אוסף",
};

export default function Symbol({
  name,
  className,
  title,
  decorative = true,
}: SymbolProps) {
  return (
    <img
      src={`/symbols/${name}.png`}
      alt={decorative ? "" : title || ALT[name]}
      title={title}
      aria-hidden={decorative || undefined}
      className={cn("site-symbol w-5 h-5", className)}
    />
  );
}
