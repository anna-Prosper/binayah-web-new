// tests/e2e/pulse-pages.spec.ts — auto-generated from iterate loop demoPath
// Stage 1: /pulse multi-page experience (Overview / Trending / Compare / Calculator / Guides)
import { test, expect } from "@playwright/test";

test.describe("Pulse multi-page golden path", () => {
  test("pulse overview loads with sub-nav", async ({ page }) => {
    await page.goto("/en/pulse");
    // Sub-nav should be visible
    await expect(page.getByRole("navigation", { name: "Pulse navigation" })).toBeVisible();
    // Overview tab should be active
    await expect(page.getByRole("link", { name: /overview/i }).first()).toBeVisible();
  });

  test("sub-nav navigates to Trending", async ({ page }) => {
    await page.goto("/en/pulse");
    await page.getByRole("link", { name: /trending/i }).first().click();
    await expect(page).toHaveURL(/\/pulse\/trending/);
    // Trending page heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sub-nav navigates to Compare", async ({ page }) => {
    await page.goto("/en/pulse");
    await page.getByRole("link", { name: /compare/i }).first().click();
    await expect(page).toHaveURL(/\/pulse\/compare/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Should show preset buttons
    await expect(page.getByText(/waterfront luxury/i)).toBeVisible();
  });

  test("sub-nav navigates to Calculator", async ({ page }) => {
    await page.goto("/en/pulse");
    await page.getByRole("link", { name: /calculator/i }).first().click();
    await expect(page).toHaveURL(/\/pulse\/calculator/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sub-nav navigates to Guides", async ({ page }) => {
    await page.goto("/en/pulse");
    await page.getByRole("link", { name: /guides/i }).first().click();
    await expect(page).toHaveURL(/\/pulse\/guides/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Should show guide cards
    await expect(page.getByText(/best areas/i)).toBeVisible();
  });

  test("guides detail page loads", async ({ page }) => {
    await page.goto("/en/pulse/guides/best-areas-dubai-2026");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Related communities section
    await expect(page.getByText(/related communities/i)).toBeVisible();
  });
});
