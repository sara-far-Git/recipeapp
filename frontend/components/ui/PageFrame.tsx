import { cn } from "@/lib/utils";

type PageTone = "forest" | "terracotta" | "sage" | "plum";

/** Written out rather than built from the tone.
 *
 * Tailwind decides which of the rules in @layer components to keep by
 * searching the source for their class names, and a name assembled at runtime
 * — `experience-page--${tone}` — is a name it never sees. Every tone but the
 * default was being dropped from the stylesheet, so ten pages that asked for
 * sage and five that asked for terracotta all quietly rendered the fallback.
 */
const TONE_CLASS: Record<PageTone, string> = {
  forest: "experience-page--forest",
  terracotta: "experience-page--terracotta",
  sage: "experience-page--sage",
  plum: "experience-page--plum",
};

type PageFrameProps = {
  children: React.ReactNode;
  tone?: PageTone;
  className?: string;
};

/** Gives product screens the home page's editorial canvas without identical layouts. */
export default function PageFrame({ children, tone = "forest", className }: PageFrameProps) {
  return (
    <div className={cn("experience-page", TONE_CLASS[tone], className)}>
      <div className="experience-page-inner">{children}</div>
    </div>
  );
}
