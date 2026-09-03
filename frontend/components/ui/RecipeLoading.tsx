import { BookOpen, ChefHat, Search, ShoppingCart } from "lucide-react";

type LoaderKind = "recipe" | "search" | "collection" | "shopping";

type RecipeLoadingProps = {
  label?: string;
  compact?: boolean;
  kind?: LoaderKind;
};

const LOADER_CONTENT = {
  recipe: { Icon: ChefHat, hint: "מארגנת את שלבי ההכנה" },
  search: { Icon: Search, hint: "עוברת על המתכונים והמצרכים" },
  collection: { Icon: BookOpen, hint: "פותחת את הספר שלך" },
  shopping: { Icon: ShoppingCart, hint: "מאחדת את המצרכים לרשימה אחת" },
} as const;

export default function RecipeLoading({
  label = "רגע קטן במטבח",
  compact = false,
  kind = "collection",
}: RecipeLoadingProps) {
  const { Icon, hint } = LOADER_CONTENT[kind];

  return (
    <div className={`recipe-loader recipe-loader--${kind}${compact ? " is-compact" : ""}`} role="status" aria-live="polite" aria-busy="true">
      <span className="recipe-loader-scene" aria-hidden="true">
        <Icon strokeWidth={1.8} />
        <span className="recipe-loader-motion"><i /><i /><i /></span>
      </span>
      <div className="recipe-loader-copy">
        <p>{label}</p>
        <span>{hint}</span>
      </div>
    </div>
  );
}
