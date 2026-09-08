"use client";

import Link from "next/link";
import ErrorNotice from "@/components/ui/ErrorNotice";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="max-w-lg mx-auto py-16 px-4">
    <h1 className="display-md text-bark-500">העמוד לא נטען כרגע</h1>
    <ErrorNotice message="משהו השתבש בטעינה. אפשר לנסות שוב או לחזור לעמוד הבית." onRetry={reset} />
    <Link href="/" className="btn-block">חזרה לעמוד הבית</Link>
  </section>;
}
