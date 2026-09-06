import { afterEach, describe, expect, it } from "vitest";
import {
  HOLIDAY_COURSES,
  HOLIDAY_MEALS,
  allPickedRecipes,
  getMeal,
  loadHolidayPlan,
  mealPickCount,
  mealPicks,
  saveHolidayPlan,
  toPick,
  type HolidayPlan,
} from "./holidayPlan";

function emptyPlan(): HolidayPlan {
  const picks: HolidayPlan["picks"] = {};
  for (const meal of HOLIDAY_MEALS) {
    picks[meal.id] = {};
    for (const course of HOLIDAY_COURSES) picks[meal.id][course.id] = null;
  }
  return { picks };
}

describe("holiday plan", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("has four Rosh Hashanah meals, two at night and two by day", () => {
    expect(HOLIDAY_MEALS).toHaveLength(4);
    expect(HOLIDAY_MEALS.filter((m) => m.when === "night").map((m) => m.id)).toEqual([
      "night-1",
      "night-2",
    ]);
    expect(HOLIDAY_MEALS.filter((m) => m.when === "day").map((m) => m.id)).toEqual([
      "day-1",
      "day-2",
    ]);
  });

  it("finds a meal by id and ignores unknown ones", () => {
    expect(getMeal("night-1")?.name).toBe("ליל א׳");
    expect(getMeal("missing")).toBeUndefined();
  });

  it("counts picks for one meal and lists them", () => {
    const plan = emptyPlan();
    plan.picks["night-1"].fish = { id: 1, title: "דג מלח" };
    plan.picks["night-1"].dessert = { id: 2, title: "דבש עוגה" };
    expect(mealPickCount(plan, "night-1")).toBe(2);
    expect(mealPicks(plan, "night-1").map((p) => p.title)).toEqual(["דג מלח", "דבש עוגה"]);
    expect(mealPickCount(plan, "day-1")).toBe(0);
  });

  it("dedupes the same recipe across meals for the shopping list", () => {
    const plan = emptyPlan();
    const shared = { id: 9, title: "חלה" };
    plan.picks["night-1"].bread = shared;
    plan.picks["night-2"].bread = shared;
    plan.picks["day-1"].fish = { id: 3, title: "סלמון" };
    const all = allPickedRecipes(plan);
    expect(all).toHaveLength(2);
    expect(all.map((p) => p.id).sort()).toEqual([3, 9]);
  });

  it("persists a plan and fills missing meals from an older save", () => {
    saveHolidayPlan({
      picks: { "night-1": { fish: { id: 4, title: "דג" } } },
    } as HolidayPlan);
    const loaded = loadHolidayPlan();
    expect(loaded.picks["night-1"].fish?.title).toBe("דג");
    expect(loaded.picks["day-2"]).toBeDefined();
    expect(loaded.picks["day-2"].dessert).toBeNull();
  });

  it("returns an empty plan when storage is corrupt", () => {
    localStorage.setItem("holiday-plan-rosh-v1", "{not-json");
    const loaded = loadHolidayPlan();
    expect(mealPickCount(loaded, "night-1")).toBe(0);
  });

  it("keeps the fields a shopping list needs on a pick", () => {
    expect(
      toPick({ id: 8, title: "מרק", image_url: "/x.jpg", servings: 6 }),
    ).toEqual({ id: 8, title: "מרק", image_url: "/x.jpg", servings: 6 });
  });
});
