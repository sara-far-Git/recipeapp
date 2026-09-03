type LoaderKind = "recipe" | "search" | "collection" | "shopping";

type RecipeLoadingProps = {
  label?: string;
  compact?: boolean;
  kind?: LoaderKind;
};

const LOADER_COPY = {
  recipe: { hint: "מערבבת את הסיר" },
  search: { hint: "מחפשת מה טוב היום" },
  collection: { hint: "פותחת את הספר שלך" },
  shopping: { hint: "אוספת מצרכים לרשימה" },
} as const;

export default function RecipeLoading({
  label = "רגע קטן במטבח",
  compact = false,
  kind = "collection",
}: RecipeLoadingProps) {
  const { hint } = LOADER_COPY[kind];

  return (
    <div
      className={`recipe-loader${compact ? " is-compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="recipe-loader-pot" aria-hidden="true">
        <span className="recipe-loader-steam"><i /><i /><i /></span>
        <span className="recipe-loader-lid" />
        <span className="recipe-loader-pan">
          <span className="recipe-loader-pops"><i /><i /><i /></span>
        </span>
      </span>
      <div className="recipe-loader-copy">
        <p>{label}</p>
        <span>{hint}</span>
      </div>
    </div>
  );
}
