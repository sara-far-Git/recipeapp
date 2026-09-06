import { Sparkles } from "lucide-react";

type RecipeLoadingProps = {
  label?: string;
  hint?: string;
  compact?: boolean;
  kind?: "recipe" | "search" | "collection" | "shopping";
};

export default function RecipeLoading({
  label = "השף הדיגיטלי עובד",
  hint,
  compact = false,
}: RecipeLoadingProps) {
  return (
    <div
      className={`recipe-loader${compact ? " is-compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="card-surface recipe-loader-panel">
        <span className="recipe-loader-mark" aria-hidden="true">
          <Sparkles className="recipe-loader-spark" strokeWidth={2} />
          <span className="recipe-loader-spin" />
        </span>
        <p>השף הדיגיטלי עובד</p>
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  );
}
