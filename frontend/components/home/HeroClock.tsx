"use client";

/**
 * The hero's mark: a ceramic pendulum clock keeping the visitor's own time.
 *
 * The hands never stop, which is the point — but they are hands on a clock, so
 * the movement reads as time passing rather than as something loading. All
 * three run as CSS animations whose period is exactly a minute, an hour and
 * twelve hours, started in the past by however far through that period the
 * real time already is. The browser then advances them on its own: accurate,
 * always moving, and no per-frame work in JavaScript.
 *
 * The pivots are measured off the artwork rather than guessed. The dial is not
 * centred in its canvas — it sits in the upper half, with the pendulum hanging
 * below — so the hands turn about (50.21%, 33.25%) and the pendulum swings
 * from its eyelet at (49.36%, 54.12%).
 */
import Image from "next/image";
import { useEffect, useState } from "react";

const LAYERS = [
  { src: "/marks/clock-pendulum.png", className: "hero-clock__pendulum" },
  { src: "/marks/clock-face.png", className: "hero-clock__face" },
] as const;

export default function HeroClock() {
  /* Null until mounted: the server has no idea what time it is where the
     visitor is, and rendering a guess would only be corrected a frame later. */
  const [now, setNow] = useState<Date | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setNow(new Date());
  }, []);

  /* Seconds through each hand's own cycle. */
  const s = now ? now.getSeconds() + now.getMilliseconds() / 1000 : 0;
  const m = now ? now.getMinutes() * 60 + s : 0;
  const h = now ? (now.getHours() % 12) * 3600 + m : 0;

  /* Still: no animation, so the hands are placed by hand instead. */
  const angle = (fraction: number) => `rotate(${fraction * 360}deg)`;

  /* The class names are written out rather than built from `name`: Tailwind
     scans the source for the classes used in @layer components and drops the
     rules for any it cannot find, and an interpolated name is invisible to it.
     Interpolating here silently cost the hands their pivot. */
  const hand = (
    src: string,
    className: string,
    seconds: number,
    period: number,
  ) => (
    <Image
      key={className}
      src={src}
      alt=""
      aria-hidden="true"
      width={1200}
      height={1200}
      className={className}
      style={
        still
          ? { transform: angle(seconds / period) }
          : ({ "--delay": `${-seconds}s` } as React.CSSProperties)
      }
    />
  );

  return (
    <div
      className={`hero-clock${now ? " is-set" : ""}${still ? " is-still" : ""}`}
      role="img"
      aria-label="שעון מטבח">
      {LAYERS.map((l) => (
        <Image
          key={l.src}
          src={l.src}
          alt=""
          aria-hidden="true"
          width={1200}
          height={1200}
          priority
          className={`hero-clock__layer ${l.className}`}
        />
      ))}
      {hand("/marks/clock-hour.png", "hero-clock__layer hero-clock__hour", h, 43200)}
      {hand("/marks/clock-minute.png", "hero-clock__layer hero-clock__minute", m, 3600)}
      {hand("/marks/clock-second.png", "hero-clock__layer hero-clock__second", s, 60)}
    </div>
  );
}
