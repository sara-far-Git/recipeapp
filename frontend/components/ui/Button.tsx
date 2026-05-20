"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
  const base = "inline-flex items-center justify-center  font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cinnamon-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40 disabled:pointer-events-none tracking-wide";
  const variants = {
  primary: "btn-fire",
  secondary: "bg-surface-50 text-bark-500 border border-bark-500 hover:bg-bark-500 hover:text-surface-100",
  ghost: "bg-transparent text-bark-400 hover:text-cinnamon-500 hover:bg-cinnamon-50",
  danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
  };
  const sizes = { sm: "px-4 py-2 text-xs gap-1.5", md: "px-6 py-2.5 text-sm gap-2", lg: "px-8 py-3.5 text-[15px] gap-2.5" };

  return (
  <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
  {loading && (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
  )}
  {children}
  </button>
  );
  }
);

Button.displayName = "Button";
export default Button;
