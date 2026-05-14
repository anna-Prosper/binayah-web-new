/**
 * main.spec.ts — Comprehensive E2E test suite for Binayah Properties
 * Run: BASE_URL=https://staging.binayahhub.com npx playwright test tests/e2e/main.spec.ts --reporter=list --timeout=30000
 */
import { test, expect } from "@playwright/test";

// ─── 1. Homepage loads ────────────────────────────────────────────────────────
test("1 - homepage loads with Binayah title and hero search", async ({ page }) => {
  await page.goto("/en");
  // Title contains Binayah
  await expect(page).toHaveTitle(/Binayah/i);
  // Hero search input — both inputs share the same placeholder; target visible one
  const searchInput = page
    .locator('input[placeholder*="3 bed"]')
    .filter({ visible: true });
  await expect(searchInput.first()).toBeVisible({ timeout: 10000 });
});

// ─── 2. Hero search → chips → navigate ──────────────────────────────────────
test("2 - hero search typing navigates to search page", async ({ page }) => {
  await page.goto("/en");
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  // Target the visible search input specifically
  const searchInput = page
    .locator('input[placeholder*="3 bed"]')
    .filter({ visible: true })
    .first();

  await searchInput.click();
  await searchInput.fill("2 bedroom apartment dubai marina");
  await page.waitForTimeout(1500);

  // Press Enter to navigate
  await searchInput.press("Enter");

  // Should land on /search (note: the app uses /search without locale prefix after hero redirect)
  await page.waitForURL(/\/search/, { timeout: 10000 });
  const url = page.url();
  expect(url).toMatch(/\/search/);
  await expect(page.locator("body")).toBeVisible();
});

// ─── 3. Search page filters — results load ───────────────────────────────────
test("3 - search page with intent/bedrooms/type shows listing results", async ({ page }) => {
  await page.goto("/en/search?intent=buy&bedrooms=1&type=Apartment");

  // Wait for loading state to clear (not stuck on "Searching...")
  await page.waitForFunction(
    () => !document.body.innerText.includes("Searching..."),
    { timeout: 20000 }
  );

  // There should be at least 1 result card (projects or listings)
  const cards = page.locator('a[href*="/project/"], a[href*="/property/"]');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

// ─── 4. Search relaxation NOT showing for bedrooms=1 ────────────────────────
test("4 - search bedrooms=1 does NOT show relaxation banner", async ({ page }) => {
  await page.goto("/en/search?intent=buy&bedrooms=1&type=Apartment");

  await page.waitForFunction(
    () => !document.body.innerText.includes("Searching..."),
    { timeout: 20000 }
  );

  // The relaxation banner contains "No exact" — only visible body elements
  const relaxationBanner = page.locator("text=/No exact/i").filter({ visible: true });
  const bannerCount = await relaxationBanner.count();
  expect(bannerCount).toBe(0);
});

// ─── 5. Off-plan tab — project cards with OFF-PLAN badge ────────────────────
test("5 - off-plan search tab shows project cards with off-plan badge", async ({ page }) => {
  // Note: /en/search redirects to /search
  await page.goto("/en/search?status=Off-Plan");
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});

  await page.waitForFunction(
    () => !document.body.innerText.includes("Searching..."),
    { timeout: 20000 }
  );

  // Wait for at least one project card to appear (client-side rendered)
  const projectCards = page.locator('a[href*="/project/"]');
  await expect(projectCards.first()).toBeVisible({ timeout: 15000 });
  const cardCount = await projectCards.count();
  expect(cardCount).toBeGreaterThan(0);

  // Look for visible badge spans containing "Off-Plan" text
  const offPlanBadge = page
    .locator("span")
    .filter({ hasText: /off.?plan/i })
    .filter({ visible: true })
    .first();

  await expect(offPlanBadge).toBeVisible({ timeout: 10000 });
});

// ─── 6. Property detail page ─────────────────────────────────────────────────
test("6 - property detail page loads with title, price, and contact form", async ({ page }) => {
  await page.goto("/en/property/10-below-internal-view-near-metro");
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});

  // Title/heading should be visible (h1 or h2, not the <title> tag)
  const heading = page.locator("h1, h2").first();
  await expect(heading).toBeVisible({ timeout: 10000 });
  const headingText = await heading.textContent();
  expect(headingText?.trim().length).toBeGreaterThan(0);

  // Price — look for visible elements with AED or numeric price
  const priceEl = page
    .locator("p, span, div")
    .filter({ hasText: /AED|Price on request/i })
    .filter({ visible: true })
    .first();
  await expect(priceEl).toBeVisible({ timeout: 10000 });

  // Contact form / inquiry section — look for visible form inputs or WhatsApp button
  const contactEl = page
    .locator('button, input')
    .filter({ hasText: /WhatsApp|Contact|Enquire/i, visible: true } as Parameters<typeof page.locator>[1])
    .or(
      page.locator('input[name="name"], input[placeholder*="name" i]').filter({ visible: true })
    )
    .first();
  await expect(contactEl).toBeVisible({ timeout: 10000 });
});

// ─── 7. Project detail page ──────────────────────────────────────────────────
test("7 - project detail page loads with project name and consultation CTA", async ({ page }) => {
  await page.goto("/en/project/binghatti-tilal-dunes");
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});

  // Project name should appear in a visible h1 or h2
  const heading = page.locator("h1, h2").filter({ visible: true }).first();
  await expect(heading).toBeVisible({ timeout: 10000 });
  const headingText = await heading.textContent();
  expect(headingText?.trim().length).toBeGreaterThan(0);

  // "Book a Free Consultation" — look for visible container (button or section), not just the <p> text
  // The CTA is inside a div/button — find any visible ancestor that contains the text
  const ctaEl = page
    .locator("button, a, div, section")
    .filter({ hasText: /Book a Free Consultation/i })
    .filter({ visible: true })
    .first();
  await expect(ctaEl).toBeVisible({ timeout: 10000 });
});

// ─── 8. Community page ───────────────────────────────────────────────────────
test("8 - Dubai Marina community page loads with title and listings section", async ({ page }) => {
  await page.goto("/en/communities/dubai-marina");
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});

  // "Dubai Marina" should appear in a visible heading (h1/h2), not the <title> tag
  const heading = page.locator("h1, h2").filter({ visible: true }).first();
  await expect(heading).toBeVisible({ timeout: 10000 });
  const headingText = await heading.textContent();
  expect(headingText?.toLowerCase()).toContain("dubai marina");

  // Listings or properties section should exist — project/property links
  const listingCards = page.locator('a[href*="/property/"], a[href*="/project/"]');
  const cardCount = await listingCards.count();
  // The page may show projects rather than individual listings; verify at least 1 card
  // OR a "Properties" heading
  if (cardCount === 0) {
    const propertiesSection = page
      .locator("h2, h3, p")
      .filter({ hasText: /Properties|Available|Listings/i })
      .filter({ visible: true })
      .first();
    await expect(propertiesSection).toBeVisible({ timeout: 5000 });
  } else {
    expect(cardCount).toBeGreaterThan(0);
  }
});

// ─── 9. 404 handling — unknown property slug ─────────────────────────────────
test("9 - unknown property slug shows not-found state, no crash", async ({ page }) => {
  const response = await page.goto("/en/property/this-slug-does-not-exist-xyz123");

  await page.waitForLoadState("domcontentloaded");
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.trim().length).toBeGreaterThan(0);

  // Should NOT show a raw React/Next.js error crash
  const isRawError = /Application error|Internal Server Error/.test(bodyText);
  expect(isRawError).toBe(false);

  if (response) {
    expect(response.status()).toBeLessThan(500);
  }
});

// ─── 10. Admin proxy auth — no cookie → 401 ──────────────────────────────────
test("10 - admin proxy returns 401 without auth cookie", async ({ page }) => {
  // Navigate to the staging site first so page.evaluate has a proper origin
  await page.goto("/en");
  await page.waitForLoadState("domcontentloaded");

  const result = await page.evaluate(async () => {
    const res = await fetch("/api/admin/proxy?path=/api/admin/projects", {
      method: "GET",
      credentials: "omit",
    });
    return { status: res.status, body: await res.text() };
  });

  expect(result.status).toBe(401);
});

// ─── 11. Currency switcher ───────────────────────────────────────────────────
test("11 - currency switcher changes displayed currency", async ({ page }) => {
  await page.goto("/en/search?intent=buy&bedrooms=1&type=Apartment");
  await page.waitForFunction(
    () => !document.body.innerText.includes("Searching..."),
    { timeout: 20000 }
  );

  // Desktop: navbar currency toggle button shows "AED"
  const currencyToggle = page
    .locator("button")
    .filter({ hasText: /^AED$/ })
    .filter({ visible: true })
    .first();

  const isCurrencyVisible = await currencyToggle.isVisible().catch(() => false);

  if (!isCurrencyVisible) {
    // Currency selector not visible at this viewport — test is N/A
    test.skip();
    return;
  }

  await currencyToggle.click();

  // USD option should appear in dropdown
  const usdOption = page
    .locator("button, li, div")
    .filter({ hasText: /^USD$/ })
    .filter({ visible: true })
    .first();
  await expect(usdOption).toBeVisible({ timeout: 3000 });
  await usdOption.click();

  // After selection, verify the toggle now shows USD
  await page.waitForTimeout(500);
  const updatedToggle = page
    .locator("button")
    .filter({ hasText: /^USD$/ })
    .filter({ visible: true })
    .first();
  await expect(updatedToggle).toBeVisible({ timeout: 5000 });
});

// ─── 12. Mobile nav — hamburger works on homepage ────────────────────────────
test("12 - mobile nav hamburger opens menu on homepage", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");

  // Hamburger / "Open menu" button
  const hamburger = page.locator('button[aria-label="Open menu"]');
  await expect(hamburger).toBeVisible({ timeout: 5000 });
  await hamburger.click();

  // After clicking, navigation links should be visible
  // The mobile nav overlay should have appeared
  await page.waitForTimeout(500);
  const menuLinks = page.locator('[role="navigation"] a, nav a').filter({ visible: true });
  await expect(menuLinks.first()).toBeVisible({ timeout: 3000 });
});

// ─── 13. No console TypeErrors ──────────────────────────────────────────────
test("13 - no TypeErrors or unhandled rejections on homepage and search", async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  // Test homepage
  await page.goto("/en");
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Test search page
  await page.goto("/en/search?intent=buy&bedrooms=1");
  await page.waitForFunction(
    () => !document.body.innerText.includes("Searching..."),
    { timeout: 20000 }
  );
  await page.waitForTimeout(1000);

  // Filter for TypeErrors and unhandled rejections — ignore pre-existing alt prop warnings
  const criticalErrors = consoleErrors.filter(
    (e) =>
      /TypeError/i.test(e) ||
      /unhandled/i.test(e) ||
      /Uncaught/i.test(e) ||
      /Cannot read prop/i.test(e)
  );

  if (criticalErrors.length > 0) {
    console.log("Critical console errors found:", criticalErrors);
  }

  expect(criticalErrors).toHaveLength(0);
});
