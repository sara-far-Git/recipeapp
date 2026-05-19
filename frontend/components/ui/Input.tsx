"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-bold text-bark-500 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref} id={id}
        className={cn("input-dark", error && "border-red-400 focus:border-red-500", className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
