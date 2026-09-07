/**
 * The waiting marks, drawn in CSS.
 *
 * Four of them, one per kind of wait, animated by the stylesheet alone — no
 * state, no timers, no frames to fetch. A loading indicator that has to
 * download a megabyte of itself before it can say "one moment" is working
 * against the thing it is there to do.
 */

function ShoppingMark() {
  return (
    <span className="illu illu-shopping">
      <span className="illu-pad">
        <i className="illu-rings" />
        <i className="illu-leaf" />
        <span className="illu-rows">
          {[0, 1, 2, 3, 4].map((row) => (
            <span key={row} className={`illu-row is-${row}`}>
              <i />
              <b />
            </span>
          ))}
        </span>
      </span>
      <span className="illu-pen" />
    </span>
  );
}

function SearchMark() {
  return (
    <span className="illu illu-search">
      <span className="illu-tab is-back" />
      <span className="illu-tab is-mid" />
      <span className="illu-card">
        <i />
        <i />
        <i />
      </span>
      <span className="illu-lens" />
    </span>
  );
}

function CollectionMark() {
  return (
    <span className="illu illu-collection">
      <span className="illu-tab is-back" />
      <span className="illu-tab is-mid" />
      <span className="illu-card">
        <i className="illu-rule" />
        <span className="illu-stars">
          {[0, 1, 2, 3, 4].map((star) => (
            <b key={star} className={`is-${star}`} />
          ))}
        </span>
      </span>
      <span className="illu-heart" />
    </span>
  );
}

function RecipeMark() {
  return (
    <span className="illu illu-recipe">
      <span className="illu-box">
        <span className="illu-stack">
          <i className="is-back" />
          <i className="is-mid" />
          <i className="is-front" />
        </span>
      </span>
    </span>
  );
}

type LoaderKind = "recipe" | "search" | "collection" | "shopping";

const MARK = {
  shopping: ShoppingMark,
  search: SearchMark,
  collection: CollectionMark,
  recipe: RecipeMark,
};

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
  const Mark = MARK[kind];

  return (
    <div
      className={`recipe-loader${compact ? " is-compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={title || label}
    >
      <span className="recipe-loader-illu" aria-hidden="true">
        <Mark />
      </span>
      {title ? <p>{title}</p> : null}
      {hint ? <span className="recipe-loader-hint">{hint}</span> : null}
    </div>
  );
}
