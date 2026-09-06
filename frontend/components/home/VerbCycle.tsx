"use client";

/**
 * One word of the headline, typed out and then rubbed out for the next.
 *
 * The word's width changes as it is typed, and this word sits in the middle of
 * a centred headline — left to itself the whole line would shuffle sideways on
 * every keystroke. So all the words are still laid in one grid cell to hold
 * the slot open at the width of the longest, and the typing happens inside
 * that: the line never moves.
 *
 * The moving part is hidden from assistive tech and one stable word is left in
 * its place, so the headline still reads as a sentence.
 */
import { useEffect, useState } from "react";

type Props = {
  /** First is the one that shows when nothing is allowed to move. */
  words: string[];
  className?: string;
};

const TYPE_MS = 95;
const ERASE_MS = 55;
const HOLD_MS = 1700;
const BETWEEN_MS = 260;

export default function VerbCycle({ words, className }: Props) {
  const [typed, setTyped] = useState(words[0]);
  const [still, setStill] = useState(true);

  /* Depend on the words themselves, not on the identity of the array holding
     them. A caller passing a literal hands over a new array on every render,
     and since typing re-renders, the effect would tear itself down and start
     again between keystrokes — the word never finished. */
  const key = words.join("\u0000");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const list = key.split("\u0000");
    setStill(false);

    let word = 0;
    let cut = list[0].length;
    let erasing = true;
    let timer = 0;

    const tick = () => {
      const full = list[word % list.length];
      cut += erasing ? -1 : 1;
      setTyped(full.slice(0, cut));

      let next = erasing ? ERASE_MS : TYPE_MS;
      if (!erasing && cut >= full.length) {
        erasing = true;
        next = HOLD_MS;
      } else if (erasing && cut <= 0) {
        erasing = false;
        word += 1;
        next = BETWEEN_MS;
      }
      timer = window.setTimeout(tick, next);
    };

    timer = window.setTimeout(tick, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [key]);

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true" className={`verb-cycle${className ? ` ${className}` : ""}`}>
        {/* Never seen. Present only to hold the slot at the width of the
            longest word, so the line does not move while the word is typed. */}
        {words.map((word) => (
          <span key={word} className="verb-cycle__ghost">
            {word}
          </span>
        ))}
        <span className="verb-cycle__typed">
          {typed}
          {!still && <i className="verb-cycle__caret" />}
        </span>
      </span>
    </>
  );
}
