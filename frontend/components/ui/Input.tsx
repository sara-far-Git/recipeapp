"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
  <div className="field-row">
  {label && (
  <label htmlFor={id} className="input-label">
  {label}
  </label>
  )}
  <input ref={ref} id={id} className={cn("input-dark", error && "border-b-red-400 focus:border-b-red-600", className)} {...props} />
  {error && <p className="mt-1 text-xs italic text-red-700" style={{ fontFamily: "'Heebo', sans-serif" }}>{error}</p>}
  </div>
  )
);

Input.displayName = "Input";
export default Input;
