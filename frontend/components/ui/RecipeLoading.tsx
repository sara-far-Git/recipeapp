import { Sparkles } from "lucide-react";

type LoaderKind = "recipe" | "search" | "collection" | "shopping";
type RecipeLoadingProps = {
  label?: string;
  title?: string;
  hint?: string;
  compact?: boolean;
  kind?: LoaderKind;
};
const LABELS: Record<LoaderKind, string> = {
  recipe: "פותח את המתכון",
  search: "מוצא מתכונים מתאימים",
  collection: "פותח את ספר המתכונים",
  shopping: "מסדר את רשימת הקניות",
};

export default function RecipeLoading({ label, title, hint, compact = false, kind = "collection" }: RecipeLoadingProps) {
  const caption = title || label || LABELS[kind];
  return (
    <div className={`recipe-loader${compact ? " is-compact" : ""}`} role="status" aria-live="polite" aria-busy="true" aria-label={caption}>
      <div className="recipe-loader-panel">
        <span className="recipe-loader-mark" aria-hidden="true">
          <Sparkles className="recipe-loader-spark" strokeWidth={2} />
          <span className="recipe-loader-spin" />
        </span>
        <p>{caption}</p>
        {hint ? <span className="recipe-loader-hint">{hint}</span> : null}
      </div>
    </div>
  );
}
