export const CATEGORIES = [
  { name: "ראשונות", desc: "פתיחה קטנה שעושה שולחן גדול", image: "/food/starters-home-v3.png" },
  { name: "עיקריות", desc: "מנות מרכזיות לאמצע השבוע ולשבת", image: "/food/mains-home-v3.png" },
  { name: "מאפים", desc: "בצקים, לחמים וריח חם מהתנור", image: "/food/bread-home-v3.png" },
  { name: "קינוחים", desc: "משהו מתוק לסגור איתו את היום", image: "/food/dessert-home-v3.png" },
  { name: "סלטים", desc: "טרי, צבעוני ומוכן מהר", image: "/food/salad-home-v3.png" },
  { name: "משקאות", desc: "חם, קר, מרענן או מפנק", image: "/food/drinks-home-v3.png" },
] as const;

export function getCategory(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}
