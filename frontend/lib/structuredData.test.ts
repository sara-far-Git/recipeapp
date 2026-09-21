import { describe, expect, it } from "vitest";
import { absoluteImage, recipeStructuredData, serializeJsonLd } from "./structuredData";
import { SITE_URL } from "./site";

describe("recipe structured data", () => {
  it("keeps recipe identity, times and ordered instructions", () => {
    const data = recipeStructuredData({
      id: 7,
      title: "לחם",
      image_url: "/bread.jpg",
      category: "מאפים",
      tags: ["שבת"],
      prep_time_minutes: 10,
      cook_time_minutes: 30,
      instructions: [{ step: 2, text: "אופים" }, { step: 1, text: "לשים" }],
    });
    expect(data?.url).toBe(`${SITE_URL}/recipe/7`);
    expect(data?.totalTime).toBe("PT40M");
    expect(data?.recipeInstructions?.map(i => i.text)).toEqual(["לשים", "אופים"]);
    expect(data?.keywords).toEqual(["מאפים", "שבת"]);
    expect(data?.aggregateRating).toBeUndefined();
    expect(data?.image).toMatchObject({ contentUrl: `${SITE_URL}/bread.jpg` });
  });
  it("marks a recipe without a photo, minus the photo", () => {
    const bare = recipeStructuredData({ id: 7, title: "לחם" });
    expect(bare?.["@type"]).toBe("Recipe");
    expect(bare?.image).toBeUndefined();
    // A recipe with no usable photo is still described in full; only the
    // image is missing, which is the one thing that cannot be invented.
    const noPhoto = recipeStructuredData({ id: 7, title: "לחם", image_url: "data:image/png;base64,abc" });
    expect(noPhoto).not.toBeNull();
    expect(noPhoto?.image).toBeUndefined();
    expect(noPhoto?.name).toBe("לחם");
  });
  it("does not disclose hidden attribution", () => {
    expect(recipeStructuredData({ id: 1, title: "לחם", image_url: "/bread.jpg", author: { full_name: "שרה פרקש" } })?.author).toBeUndefined();
  });
  it("safely embeds user text without changing its JSON value", () => {
    const data = { name: '</script><script>alert(1)</script>' };
    const encoded = serializeJsonLd(data);
    expect(encoded).not.toContain('<');
    expect(JSON.parse(encoded)).toEqual(data);
  });
  it("resolves photo paths and excludes non-web images", () => {
    expect(absoluteImage('/photo.jpg')).toBe(`${SITE_URL}/photo.jpg`);
    expect(absoluteImage('data:image/png;base64,abc')).toBeUndefined();
  });
});

it("uses consecutive breadcrumb positions and encoded absolute URLs", async () => {
  const { breadcrumbStructuredData } = await import("./structuredData");
  const data = breadcrumbStructuredData([
    { name: "בית", path: "/" },
    { name: "מאפים", path: `/category/${encodeURIComponent("מאפים")}` },
    { name: "לחם", path: "/recipe/7" },
  ]);
  expect(data.itemListElement.map(i => i.position)).toEqual([1, 2, 3]);
  expect(data.itemListElement[1].item).toBe(`${SITE_URL}/category/${encodeURIComponent("מאפים")}`);
  expect(data.itemListElement[2].name).toBe("לחם");
});


it("lists only public recipes in display order without duplicate URLs", async () => {
  const { recipeListStructuredData } = await import("./structuredData");
  const data = recipeListStructuredData([
    { id: 8, is_published: true }, { id: 2, is_published: false },
    { id: 8, is_published: true }, { id: 4, is_published: true }, { id: 9 },
  ]);
  expect(data?.itemListElement).toEqual([
    { "@type": "ListItem", position: 1, url: `${SITE_URL}/recipe/8` },
    { "@type": "ListItem", position: 2, url: `${SITE_URL}/recipe/4` },
  ]);
  expect(recipeListStructuredData([])).toBeNull();
  expect(recipeListStructuredData([{ id: 8, is_published: true }])).toBeNull();
});


it("describes the actual recipe photo without inventing image ownership", () => {
  const data = recipeStructuredData({ id: 7, title: "לחם", image_url: "/bread.jpg", author: { full_name: "שף" } });
  expect(data?.image).toMatchObject({ "@type": "ImageObject", contentUrl: `${SITE_URL}/bread.jpg`, name: "לחם" });
  expect(data?.image).not.toHaveProperty("creator");
  expect(data?.image).not.toHaveProperty("license");
  expect(data?.image).not.toHaveProperty("copyrightNotice");
  const noPhoto = recipeStructuredData({ id: 7, title: "לחם", image_url: "data:image/png;base64,abc" });
  expect(noPhoto?.image).toBeUndefined();
});

it("still describes a recipe that has no photograph at all", () => {
  const data = recipeStructuredData({
    id: 9,
    title: "מרק עדשים",
    servings: 4,
    ingredients: [{ name: "עדשים", amount: 1, unit: "כוס" }],
    instructions: [{ step: 1, text: "מבשלים." }],
  });
  expect(data).not.toBeNull();
  expect(data?.["@type"]).toBe("Recipe");
  expect(data?.image).toBeUndefined();
  expect(data?.recipeIngredient).toEqual(["1 כוס עדשים"]);
  expect(data?.recipeInstructions).toHaveLength(1);
});
