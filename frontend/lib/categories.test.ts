import { describe, expect, it } from "vitest";
import { CATEGORIES, getCategory } from "./categories";

describe("categories", () => {
  it("has the six kitchen shelves the site uses", () => {
    expect(CATEGORIES.map((c) => c.name)).toEqual([
      "ראשונות",
      "עיקריות",
      "מאפים",
      "קינוחים",
      "סלטים",
      "משקאות",
    ]);
  });

  it("finds a known category and misses an unknown one", () => {
    expect(getCategory("מאפים")?.desc).toContain("בצקים");
    expect(getCategory("פיצות")).toBeUndefined();
  });
});
