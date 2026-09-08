"use client";

import { usePathname } from "next/navigation";
import RecipeLoading from "@/components/ui/RecipeLoading";

export default function Loading() {
  const path = usePathname();
  const label = path.startsWith("/shopping") ? "מסדר את רשימת הקניות"
    : path.startsWith("/recipe/") ? "פותח את המתכון"
    : path.startsWith("/search") || path.startsWith("/category/") ? "מוצא מתכונים מתאימים"
    : path.startsWith("/holiday") ? "מסדר את סעודות החג"
    : path.startsWith("/profile/") ? "טוען את הפרופיל"
    : path.startsWith("/login") ? "מכין את הכניסה לספר"
    : path.startsWith("/register") ? "מכין מקום לספר שלכם"
    : "פותח את ספר המתכונים";
  return <RecipeLoading label={label} />;
}
