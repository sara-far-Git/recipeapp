import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הדף לא נמצא",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-24">
      <h1 className="display-lg text-bark-500 mb-4">הדף לא נמצא</h1>
      <p className="text-bark-300 text-[15px] mb-9">
        הקישור אולי השתנה, או שהדף כבר לא קיים.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="btn-block">חזרה לדף הבית</Link>
        <Link href="/search" className="font-bold text-bark-300 hover:text-cinnamon-500">חיפוש מתכונים</Link>
      </div>
    </div>
  );
}
