import { Sparkles } from "lucide-react";

type RecipeLoadingProps = {
  label?: string;
  title?: string;
  hint?: string;
  compact?: boolean;
  kind?: "recipe" | "search" | "collection" | "shopping";
};

export default function RecipeLoading({
  label = "טוען",
  title,
  hint,
  compact = false,
}: RecipeLoadingProps) {
  const hasCopy = Boolean(title || hint);

  return (
    <div
      className={`recipe-loader${compact ? " is-compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={title || label}
    >
      <div className={`card-surface recipe-loader-panel${hasCopy ? "" : " is-mark-only"}`}>
        <span className="recipe-loader-mark" aria-hidden="true">
          <Sparkles className="recipe-loader-spark" strokeWidth={2} />
          <span className="recipe-loader-spin" />
        </span>
        {title ? <p>{title}</p> : null}
        {hint ? <span className="recipe-loader-hint">{hint}</span> : null}
      </div>
    </div>
  );
}
