import { describe, expect, it } from "vitest";
import { absoluteImage, recipeStructuredData, serializeJsonLd } from "./structuredData";
import { SITE_URL } from "./site";

describe("recipe structured data", () => {
  it("keeps recipe identity, times and ordered instructions", () => {
    const data = recipeStructuredData({ id: 7, title: "לחם", prep_time_minutes: 10, cook_time_minutes: 30,
      instructions: [{ step: 2, text: "אופים" }, { step: 1, text: "לשים" }] });
    expect(data.url).toBe(`${SITE_URL}/recipe/7`);
    expect(data.totalTime).toBe("PT40M");
    expect(data.recipeInstructions.map(i => i.text)).toEqual(["לשים", "אופים"]);
    expect(data.aggregateRating).toBeUndefined();
    expect(data.image).toBeUndefined();
  });
  it("does not disclose hidden attribution", () => {
    expect(recipeStructuredData({ id: 1, title: "לחם", author: { full_name: "שרה פרקש" } }).author).toBeUndefined();
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
  expect(data.image).toMatchObject({ "@type": "ImageObject", contentUrl: `${SITE_URL}/bread.jpg`, name: "לחם" });
  expect(data.image).not.toHaveProperty("creator");
  expect(data.image).not.toHaveProperty("license");
  expect(data.image).not.toHaveProperty("copyrightNotice");
  expect(recipeStructuredData({ id: 7, title: "לחם", image_url: "data:image/png;base64,abc" }).image).toBeUndefined();
});
