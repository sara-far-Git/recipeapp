"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** A short instruction under the field, read out with it. */
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
  // A label only names its field when the two share an id; callers that
  // forget to pass one still get a working pair.
  const autoId = useId();
  const fieldId = id || autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId, props["aria-describedby"]].filter(Boolean).join(" ") || undefined;
  return (
  <div className="field-row">
  {label && (
  <label htmlFor={fieldId} className="input-label">
  {label}
  </label>
  )}
  <input ref={ref} id={fieldId} aria-invalid={error ? true : undefined} {...props} aria-describedby={describedBy}
  className={cn("input-dark", error && "border-b-red-400 focus:border-b-red-600", className)} />
  {hint && <p id={hintId} className="mt-1 text-xs text-bark-400">{hint}</p>}
  {error && <p id={errorId} role="alert" className="mt-1 text-xs font-bold text-red-800">{error}</p>}
  </div>
  );
  }
);

Input.displayName = "Input";
export default Input;
