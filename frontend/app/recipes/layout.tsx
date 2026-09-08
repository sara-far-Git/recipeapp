import type { Metadata } from "next";
export const metadata: Metadata = { title: "כל המתכונים", description: "המתכונים של הקהילה, עם סינון לפי שף, קטגוריה, זמן הכנה, כשרות ורמת קושי." };
export default function RecipesLayout({ children }: { children: React.ReactNode }) { return children; }
