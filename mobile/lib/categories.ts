/**
 * The site's six categories, in the site's order.
 *
 * Kept in step with frontend/lib/categories.ts — a recipe saved on the phone
 * has to land in the same category the website will file it under, so the
 * names here are the website's names exactly, not a paraphrase of them.
 */
export const CATEGORIES = [
  "ראשונות",
  "עיקריות",
  "מאפים",
  "קינוחים",
  "סלטים",
  "משקאות",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** The one-line description the site shows under a category's name. */
export const CATEGORY_DESC: Record<string, string> = {
  "ראשונות": "פתיחה קטנה שעושה שולחן גדול",
  "עיקריות": "מנות מרכזיות לאמצע השבוע ולשבת",
  "מאפים": "בצקים, לחמים וריח חם מהתנור",
  "קינוחים": "משהו מתוק לסגור איתו את היום",
  "סלטים": "טרי, צבעוני ומוכן מהר",
  "משקאות": "חם, קר, מרענן או מפנק",
};

/** A category always wears the same colour, the way it wears the same tab on
 *  the site — so a glance at a list is enough to tell the groups apart. */
const TONES: Record<string, string> = {
  "ראשונות": "#4F8B77",
  "עיקריות": "#B86028",
  "מאפים": "#C08A3E",
  "קינוחים": "#B3452B",
  "סלטים": "#2F6B5D",
  "משקאות": "#8B6040",
};

export const categoryTone = (name?: string | null) =>
  (name && TONES[name]) || "#A07C56";
