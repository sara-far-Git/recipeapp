import { cn } from "@/lib/utils";

type PageTone = "forest" | "terracotta" | "sage" | "plum";

type PageFrameProps = {
  children: React.ReactNode;
  tone?: PageTone;
  className?: string;
};

/** Gives product screens the home page's editorial canvas without identical layouts. */
export default function PageFrame({ children, tone = "forest", className }: PageFrameProps) {
  return (
    <div className={cn("experience-page", `experience-page--${tone}`, className)}>
      <div className="experience-page-inner">{children}</div>
    </div>
  );
}
