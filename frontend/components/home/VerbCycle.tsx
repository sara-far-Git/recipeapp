"use client";

/**
 * One word of the headline, changing.
 *
 * All the words are laid in the same grid cell, so the slot is as wide as the
 * longest of them and the rest of the line never moves as they swap. Each word
 * runs the same animation, started a slice of the cycle apart, which means
 * there is no timer to drift and nothing to re-render — the browser runs it.
 *
 * The moving part is hidden from assistive tech and one stable word is left in
 * its place, so the headline still reads as a sentence.
 */
type Props = {
  /** First is the one that shows when nothing is allowed to move. */
  words: string[];
  className?: string;
};

const STEP_SECONDS = 2.4;

export default function VerbCycle({ words, className }: Props) {
  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span
        aria-hidden="true"
        className={`verb-cycle${className ? ` ${className}` : ""}`}
        style={
          {
            "--verb-count": words.length,
            "--verb-cycle": `${words.length * STEP_SECONDS}s`,
          } as React.CSSProperties
        }>
        {words.map((word, i) => (
          <span
            key={word}
            style={{ ["--verb-index" as string]: i } as React.CSSProperties}>
            {word}
          </span>
        ))}
      </span>
    </>
  );
}
