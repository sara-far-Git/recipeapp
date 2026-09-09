import Link from "next/link";
import { breadcrumbStructuredData, serializeJsonLd, type BreadcrumbItem } from "@/lib/structuredData";

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="נתיב ניווט" dir="rtl" className="mx-auto max-w-6xl px-4 pt-5 text-sm text-forest-700 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbStructuredData(items)) }} />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={item.path} className="flex min-w-0 items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-cinnamon-500">/</span>}
            {index === items.length - 1
              ? <span aria-current="page" className="break-words font-semibold">{item.name}</span>
              : <Link href={item.path} className="rounded-sm py-2 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cinnamon-500">{item.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
