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
    const base = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cinnamon-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-40 disabled:pointer-events-none";
    const variants = {
      primary: "btn-fire",
      secondary: "bg-surface-200 text-bark-500 border border-surface-400 hover:bg-surface-300 hover:border-cinnamon-400 hover:text-cinnamon-600",
      ghost: "bg-transparent text-bark-400 hover:text-bark-600 hover:bg-surface-200",
      danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    };
    const sizes = { sm: "px-3.5 py-2 text-xs gap-1.5", md: "px-5 py-2.5 text-sm gap-2", lg: "px-7 py-3.5 text-[15px] gap-2.5" };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
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
