export const CATEGORIES = [
  { name: "ראשונות", desc: "מנות שפותחות את השולחן", image: "/food/starters.png" },
  { name: "עיקריות", desc: "המנה שכולם מחכים לה", image: "/food/hero.png" },
  { name: "מאפים", desc: "לחם, בצק, וריח מהתנור", image: "/food/bread.png" },
  { name: "קינוחים", desc: "הסוף המתוק", image: "/food/dessert.png" },
  { name: "סלטים", desc: "ירוק, קר, ומוכן מהר", image: "/food/mezze.png" },
  { name: "משקאות", desc: "חם, קר, ומה שבאמצע", image: "/food/starters.png" },
] as const;

export function getCategory(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}
