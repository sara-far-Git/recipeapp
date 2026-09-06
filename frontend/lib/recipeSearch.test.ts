import { describe, expect, it } from "vitest";
import { mergeRecipesById, recipeMatchesCategory, recipeMatchesSearch } from "./recipeSearch";

describe("recipeMatchesCategory", () => {
  it("uses the stored category when the recipe has one", () => {
    expect(recipeMatchesCategory({ title: "מרק", category: "מאפים" }, "מאפים")).toBe(true);
    expect(recipeMatchesCategory({ title: "מרק", category: "מאפים" }, "ראשונות")).toBe(false);
  });

  it("falls back to title hints for older recipes without a category", () => {
    expect(recipeMatchesCategory({ title: "עוגיות שוקולד" }, "מאפים")).toBe(true);
    expect(recipeMatchesCategory({ title: "סלט ירוק" }, "סלטים")).toBe(true);
    expect(recipeMatchesCategory({ title: "סלט ירוק" }, "מאפים")).toBe(false);
  });

  it("rejects an unknown category name", () => {
    expect(recipeMatchesCategory({ title: "עוגה" }, "לא קיים")).toBe(false);
  });
});

describe("recipeMatchesSearch", () => {
  const cake = {
    title: "עוגת שוקולד",
    description: "קלאסית",
    category: "מאפים",
    difficulty: "easy",
    kosher_type: "dairy",
    prep_time_minutes: 20,
  };

  it("matches every word, including a Hebrew stem", () => {
    expect(recipeMatchesSearch(cake, { q: "עוגה שוקולד" })).toBe(true);
    expect(recipeMatchesSearch(cake, { q: "עוגה גבינה" })).toBe(false);
  });

  it("applies category, difficulty, kosher and time together", () => {
    expect(recipeMatchesSearch(cake, { category: "מאפים", difficulty: "easy" })).toBe(true);
    expect(recipeMatchesSearch(cake, { difficulty: "hard" })).toBe(false);
    expect(recipeMatchesSearch(cake, { kosher_type: "meat" })).toBe(false);
    expect(recipeMatchesSearch(cake, { max_prep_time: 15 })).toBe(false);
    expect(recipeMatchesSearch(cake, { max_prep_time: 30 })).toBe(true);
  });
});

describe("mergeRecipesById", () => {
  it("keeps the later copy and sorts newest first", () => {
    const publicList = [
      { id: 1, title: "ישן", created_at: "2026-01-01T00:00:00Z" },
      { id: 2, title: "פומבי", created_at: "2026-02-01T00:00:00Z" },
    ];
    const personal = [
      { id: 1, title: "הטיוטה שלי", created_at: "2026-03-01T00:00:00Z" },
    ];
    const merged = mergeRecipesById(publicList, personal);
    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe(1);
    expect(merged[0].title).toBe("הטיוטה שלי");
    expect(merged[1].id).toBe(2);
  });
});
