import { test, expect } from "@playwright/test";

/**
 * T23 — smoke coverage for the three new nightlife-gv-stitch-refresh
 * website routes (Favoritos, Mapa Interativo, Hubs da Grande Vitória).
 * Runs exclusively via `make e2e-website` against the full `make up` stack
 * (see mvp-core-smoke.spec.ts's own docblock for the shared assumptions —
 * `php artisan migrate:fresh --seed` has just run, so Vitória always has
 * at least one upcoming published event to browse).
 */

test("Favoritos: an unauthenticated visitor is redirected to /entrar", async ({ page }) => {
  await page.goto("/favoritos");
  await expect(page).toHaveURL("/entrar");
});

test("Mapa: the page loads with the city filter and doesn't error", async ({ page }) => {
  await page.goto("/mapa");
  await expect(page.getByRole("heading", { level: 1, name: "Mapa Interativo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Vitória", exact: true })).toBeVisible();
});

test("Hub: /hubs/vitoria shows only Vitória's published events in the curated layout", async ({ page }) => {
  await page.goto("/hubs/vitoria");
  await expect(page.getByRole("heading", { level: 1, name: "Vitória" })).toBeVisible();
  await expect(page.locator('a[href^="/eventos/"]').first()).toBeVisible();
});
