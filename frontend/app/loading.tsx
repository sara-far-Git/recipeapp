"use client";

import { usePathname } from "next/navigation";
import RecipeLoading from "@/components/ui/RecipeLoading";

export default function Loading() {
  const path = usePathname();
  const label = path.startsWith("/shopping") ? "מסדרת את רשימת הקניות"
    : path.startsWith("/recipe/") ? "פותחת את המתכון"
    : path.startsWith("/search") || path.startsWith("/category/") ? "מוצאת מתכונים מתאימים"
    : path.startsWith("/holiday") ? "מסדרת את סעודות החג"
    : path.startsWith("/profile/") ? "טוענת את הפרופיל"
    : path.startsWith("/login") ? "מכינה את הכניסה לספר"
    : path.startsWith("/register") ? "מכינה מקום לספר שלכם"
    : "פותחת את ספר המתכונים";
  return <RecipeLoading label={label} />;
}
