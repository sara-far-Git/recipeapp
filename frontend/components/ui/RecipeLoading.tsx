type LoaderKind = "recipe" | "search" | "collection" | "shopping";

type RecipeLoadingProps = {
  label?: string;
  title?: string;
  hint?: string;
  compact?: boolean;
  kind?: LoaderKind;
};

export default function RecipeLoading({
  label = "טוען",
  title,
  hint,
  compact = false,
  kind = "collection",
}: RecipeLoadingProps) {
  const src = kind === "search" ? "/symbols/lens.png" : `/loaders/${kind}-scene.png`;
  return (
    <div
      className={`recipe-loader${compact ? " is-compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={title || label}
    >
      <span className={`recipe-loader-illu is-${kind}`} aria-hidden="true">
        <img src={src} alt="" />
      </span>
      {title ? <p>{title}</p> : null}
      {hint ? <span className="recipe-loader-hint">{hint}</span> : null}
    </div>
  );
}
