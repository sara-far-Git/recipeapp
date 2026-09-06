import { expect, test, type Page } from "@playwright/test";

async function assertNoServerError(page: Page) {
  await expect(page.locator("body")).not.toContainText("Server Error");
  await expect(page.locator("body")).not.toContainText("Application error");
}

test.describe("public pages render", () => {
  test("home shows the hero and main nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /מה (נכין|בא לך)/ })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "תכנון חג" })).toBeVisible();
    await expect(page.locator(".assistant-composer input")).toBeAttached();
    await assertNoServerError(page);
  });

  test("search page has a query field and category chips", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByLabel("חיפוש מתכון")).toBeVisible();
    await expect(page.getByRole("button", { name: "מאפים" })).toBeVisible();
    await assertNoServerError(page);
  });

  test("holiday board lists four meals", async ({ page }) => {
    await page.goto("/holiday");
    await expect(page.getByRole("heading", { name: "ארבע סעודות" })).toBeVisible();
    await expect(page.getByText("ליל א׳")).toBeVisible();
    await expect(page.getByText("ליל ב׳")).toBeVisible();
    await expect(page.getByText("יום א׳")).toBeVisible();
    await expect(page.getByText("יום ב׳")).toBeVisible();
    await assertNoServerError(page);
  });

  test("a holiday meal page opens", async ({ page }) => {
    await page.goto("/holiday/night-1");
    await expect(page.getByRole("heading", { name: "ליל א׳" })).toBeVisible();
    await expect(page.getByText("סעודת לילה")).toBeVisible();
    await assertNoServerError(page);
  });

  test("unknown holiday meal explains itself", async ({ page }) => {
    await page.goto("/holiday/not-a-meal");
    await expect(page.getByText("הסעודה הזאת לא קיימת.")).toBeVisible();
    await expect(page.getByRole("link", { name: "חזרה לראש השנה" })).toBeVisible();
  });

  test("login and register forms are usable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "חוזרים לספר" })).toBeVisible();
    await expect(page.getByLabel("אימייל")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "הרשמה" }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel("אימייל")).toBeVisible();
    await assertNoServerError(page);
  });

  test("privacy and terms pages have their titles", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "מדיניות פרטיות" })).toBeVisible();
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "תנאי שימוש" })).toBeVisible();
  });

  test("category page renders a known shelf", async ({ page }) => {
    await page.goto("/category/" + encodeURIComponent("מאפים"));
    await expect(page.getByRole("heading", { name: "מאפים" })).toBeVisible();
    await assertNoServerError(page);
  });
});

test.describe("flows", () => {
  test("home search submits to the search page", async ({ page }) => {
    await page.goto("/");
    const box = page.locator(".assistant-composer input");
    await box.scrollIntoViewIfNeeded();
    await box.fill("עוף");
    await page.getByRole("button", { name: "חיפוש מתכון" }).click();
    await expect(page).toHaveURL(/\/search\?q=/);
  });

  test("nav can open holiday planning", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "תכנון חג" }).click({ force: true });
    await expect(page).toHaveURL(/\/holiday/);
    await expect(page.getByRole("heading", { name: "ארבע סעודות" })).toBeVisible();
  });

  test("holiday meal link opens the first night", async ({ page }) => {
    await page.goto("/holiday");
    await page.locator('a[href="/holiday/night-1"]').click();
    await expect(page).toHaveURL(/\/holiday\/night-1/);
    await expect(page.getByRole("heading", { name: "ליל א׳" })).toBeVisible();
  });

  test("login with a bad password stays on the form", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("אימייל").fill("nobody@example.com");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: "התחברות" }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("form")).toBeVisible();
  });
});
