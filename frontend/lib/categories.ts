export const CATEGORIES = [
  { name: "ראשונות", desc: "פתיחה קטנה שעושה שולחן גדול", image: "/food/starters-v5.jpg" },
  { name: "עיקריות", desc: "מנות מרכזיות לאמצע השבוע ולשבת", image: "/food/mains-v5.jpg" },
  { name: "מאפים", desc: "בצקים, לחמים וריח חם מהתנור", image: "/food/bread-v5.jpg" },
  { name: "קינוחים", desc: "משהו מתוק לסגור איתו את היום", image: "/food/dessert-v5.jpg" },
  { name: "סלטים", desc: "טרי, צבעוני ומוכן מהר", image: "/food/salad-v5.jpg" },
  { name: "משקאות", desc: "חם, קר, מרענן או מפנק", image: "/food/drinks-v5.jpg" },
] as const;

export function getCategory(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}

/** Labels that cut across the categories, and can combine: a Passover cake
 *  is a dessert, a Passover recipe, and sometimes gluten-free as well. */
export const TAGS = ["פסח", "ללא גלוטן"] as const;
