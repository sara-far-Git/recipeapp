import Image from "next/image";

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
      {/* The mark itself, working: the same two renders the hero uses, with
          the card lifting out of the box and settling back. */}
      <span className="recipe-loader-box" aria-hidden="true">
        <Image
          src="/marks/card-front.png"
          alt=""
          width={1206}
          height={1116}
          sizes="120px"
          className="recipe-loader-card"
        />
        <Image
          src="/marks/box-front.png"
          alt=""
          width={1171}
          height={1233}
          sizes="120px"
          className="recipe-loader-front"
        />
      </span>
      <div className="recipe-loader-copy">
        <p>{label}</p>
        <span>{hint}</span>
      </div>
    </div>
  );
}
