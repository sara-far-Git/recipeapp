export const CATEGORIES = [
  { name: "ראשונות", desc: "פתיחה קטנה שעושה שולחן גדול", image: "/food/starters-v4.png" },
  { name: "עיקריות", desc: "מנות מרכזיות לאמצע השבוע ולשבת", image: "/food/mains-v4.png" },
  { name: "מאפים", desc: "בצקים, לחמים וריח חם מהתנור", image: "/food/bread-v4.png" },
  { name: "קינוחים", desc: "משהו מתוק לסגור איתו את היום", image: "/food/dessert-v4.png" },
  { name: "סלטים", desc: "טרי, צבעוני ומוכן מהר", image: "/food/salad-v4.png" },
  { name: "משקאות", desc: "חם, קר, מרענן או מפנק", image: "/food/drinks-v4.png" },
] as const;

export function getCategory(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}
