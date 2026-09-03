type RecipeLoadingProps = {
  label?: string;
  compact?: boolean;
};

export default function RecipeLoading({
  label = "רגע קטן במטבח",
  compact = false,
}: RecipeLoadingProps) {
  return (
    <div className={`recipe-loader${compact ? " is-compact" : ""}`} role="status" aria-live="polite" aria-busy="true">
      <span className="recipe-loader-track" aria-hidden="true"><i /></span>
      <p>{label}</p>
    </div>
  );
}
