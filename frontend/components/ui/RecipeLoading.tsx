type RecipeLoadingProps = {
  label?: string;
  compact?: boolean;
  kind?: "recipe" | "search" | "collection" | "shopping";
};

export default function RecipeLoading({
  label = "טוען",
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
      <span className="recipe-loader-spin" aria-hidden="true" />
    </div>
  );
}
