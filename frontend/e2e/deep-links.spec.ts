import { expect, test } from "@playwright/test";

// Each case starts in a fresh session, without first visiting the homepage.
for (const path of ["/recipe/1", "/category/" + encodeURIComponent("מאפים"), "/search?q=test"]) {
  test(`first visit preserves ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("html")).not.toHaveClass(/logo-intro/);
    await expect(page.locator(".logo-intro-veil")).toHaveCount(0);
    // Observe beyond the former 4.6-second intro redirect deadline.
    await page.waitForTimeout(6000);
    expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe(path);
    await expect(page.locator(".logo-intro-veil")).toHaveCount(0);
  });
}
