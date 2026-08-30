export const CATEGORIES = [
  { name: "ראשונות", desc: "מנות פתיחה שפותחות את הארוחה" },
  { name: "עיקריות", desc: "ארוחה מלאה על צלחת אחת" },
  { name: "מאפים", desc: "לחמים, בצקים וכל מה שבתנור" },
  { name: "קינוחים", desc: "הסוף המתוק, בלי להתנצל" },
  { name: "סלטים", desc: "ירק, טרי, ובעיקר מהיר" },
  { name: "משקאות", desc: "חמים, קרים, ומשהו באמצע" },
] as const;

export function getCategory(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}
