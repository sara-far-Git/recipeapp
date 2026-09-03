import { ChefHat } from "lucide-react";

type RecipeLoadingProps = {
  label?: string;
  compact?: boolean;
};

export default function RecipeLoading({
  label = "רגע קטן במטבח",
  compact = false,
}: RecipeLoadingProps) {
  return (
    <div className={`recipe-loader${compact ? " is-compact" : ""}`} role="status" aria-live="polite">
      <div className="recipe-loader-mark" aria-hidden="true">
        <span className="recipe-loader-steam recipe-loader-steam-one" />
        <span className="recipe-loader-steam recipe-loader-steam-two" />
        <span className="recipe-loader-steam recipe-loader-steam-three" />
        <ChefHat strokeWidth={1.65} />
      </div>
      <p>{label}</p>
    </div>
  );
}
