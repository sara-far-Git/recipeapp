export type HolidayCourse = {
  id: string;
  name: string;
  desc: string;
  category?: string;
  queries?: string[];
};

export type HolidayMeal = {
  id: string;
  name: string;
  desc: string;
  when: "night" | "day";
};

export type HolidayPick = {
  id: number;
  title: string;
  image_url?: string | null;
  servings?: number;
};

export type HolidayPlan = {
  picks: Record<string, Record<string, HolidayPick | null>>;
};

export const HOLIDAY_MEALS: HolidayMeal[] = [
  {
    id: "night-1",
    name: "ליל א׳",
    desc: "סעודת הלילה הראשון של ראש השנה.",
    when: "night",
  },
  {
    id: "night-2",
    name: "ליל ב׳",
    desc: "סעודת הלילה השני.",
    when: "night",
  },
  {
    id: "day-1",
    name: "יום א׳",
    desc: "סעודת היום הראשון.",
    when: "day",
  },
  {
    id: "day-2",
    name: "יום ב׳",
    desc: "סעודת היום השני.",
    when: "day",
  },
];

export const HOLIDAY_COURSES: HolidayCourse[] = [
  { id: "fish", name: "דגים", desc: "בחרו דג אחד לשולחן", queries: ["דג", "סלמון", "דגים"] },
  { id: "starters", name: "ראשונות", desc: "פתיחה קטנה", category: "ראשונות" },
  { id: "mains", name: "עיקריות", desc: "המנה שבמרכז", category: "עיקריות" },
  { id: "salads", name: "סלטים", desc: "משהו טרי ליד", category: "סלטים" },
  { id: "bread", name: "מאפים", desc: "לחם, חלה או מאפה", category: "מאפים" },
  { id: "dessert", name: "קינוחים", desc: "סגירה מתוקה", category: "קינוחים" },
  { id: "drinks", name: "משקאות", desc: "חם או קר", category: "משקאות" },
];

const STORAGE_KEY = "holiday-plan-rosh-v1";

function emptyPlan(): HolidayPlan {
  const picks: HolidayPlan["picks"] = {};
  for (const meal of HOLIDAY_MEALS) {
    picks[meal.id] = {};
    for (const course of HOLIDAY_COURSES) picks[meal.id][course.id] = null;
  }
  return { picks };
}

export function loadHolidayPlan(): HolidayPlan {
  if (typeof window === "undefined") return emptyPlan();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPlan();
    const parsed = JSON.parse(raw) as HolidayPlan;
    const next = emptyPlan();
    for (const meal of HOLIDAY_MEALS) {
      next.picks[meal.id] = { ...next.picks[meal.id], ...(parsed.picks?.[meal.id] || {}) };
    }
    return next;
  } catch {
    return emptyPlan();
  }
}

export function saveHolidayPlan(plan: HolidayPlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function getMeal(id: string) {
  return HOLIDAY_MEALS.find((m) => m.id === id);
}

export function mealPickCount(plan: HolidayPlan, mealId: string) {
  return mealPicks(plan, mealId).length;
}

export function mealPicks(plan: HolidayPlan, mealId: string): HolidayPick[] {
  return HOLIDAY_COURSES.map((course) => plan.picks[mealId]?.[course.id]).filter(
    (pick): pick is HolidayPick => Boolean(pick),
  );
}

export function allPickedRecipes(plan: HolidayPlan): HolidayPick[] {
  const seen = new Set<number>();
  const out: HolidayPick[] = [];
  for (const meal of HOLIDAY_MEALS) {
    for (const course of HOLIDAY_COURSES) {
      const pick = plan.picks[meal.id]?.[course.id];
      if (pick && !seen.has(pick.id)) {
        seen.add(pick.id);
        out.push(pick);
      }
    }
  }
  return out;
}

export function toPick(recipe: { id: number; title: string; image_url?: string | null; servings?: number }): HolidayPick {
  return {
    id: recipe.id,
    title: recipe.title,
    image_url: recipe.image_url,
    servings: recipe.servings,
  };
}
