export const CATEGORIES = [
  { name: "ראשונות", desc: "פתיחה קטנה שעושה שולחן גדול", image: "/food/starters-v2.png" },
  { name: "עיקריות", desc: "מנות מרכזיות לאמצע השבוע ולשבת", image: "/food/mains-v2.png" },
  { name: "מאפים", desc: "בצקים, לחמים וריח חם מהתנור", image: "/food/bread-v2.png" },
  { name: "קינוחים", desc: "משהו מתוק לסגור איתו את היום", image: "/food/dessert-v2.png" },
  { name: "סלטים", desc: "טרי, צבעוני ומוכן מהר", image: "/food/mezze-v2.png" },
  { name: "משקאות", desc: "חם, קר, מרענן או מפנק", image: "/food/drinks-v2.png" },
] as const;

export function getCategory(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}
