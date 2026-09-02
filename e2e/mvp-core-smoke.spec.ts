import { test, expect } from "@playwright/test";

/**
 * W24 — full MVP Core smoke test: browse the home feed -> filter by city ->
 * open an event's detail page -> sign up -> verify the account via the
 * fixed OTP test code -> log in -> view the profile page.
 *
 * Runs exclusively via `make e2e-website` (docker compose exec website npx
 * playwright test) against the full `make up` stack — see
 * playwright.config.ts and root Makefile. Assumes `php artisan migrate:fresh
 * --seed` has just run: EventSeeder cycles every genre x status combo across
 * all 4 cities, so "Vitória" (the home page's default active city) always
 * has at least one upcoming published event to browse.
 *
 * The signup->verify step uses qor-api's fixed local/testing-only OTP code
 * ("000000", config('qor.auth.otp_fixed_test_code')) instead of reading a
 * real email — see api/src/Infrastructure/Auth/OtpAdapter.php's
 * generateCode() docblock for why this exists (a debug endpoint was tried
 * first and rejected by review as an unauthenticated secret-disclosure
 * surface).
 */
const FIXED_OTP_CODE = "000000";
const RUN_ID = Date.now();
const FAN_NAME = "Ana E2E";
const FAN_EMAIL = `fan-e2e-${RUN_ID}@qor.dev`;
const FAN_PASSWORD = "Senha123";

test("MVP Core: browse -> filter -> event detail -> signup -> verify (OTP) -> login -> profile", async ({ page }) => {
  // --- Step 1: browse the home feed, filtered to Vitória (the default city) ---
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Vitória", exact: true })).toHaveAttribute("aria-pressed", "true");

  const firstEventLink = page.locator('a[href^="/eventos/"]').first();
  await expect(firstEventLink).toBeVisible();

  // --- Step 2: open the event detail page ---
  await firstEventLink.click();
  await expect(page).toHaveURL(/\/eventos\/\d+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // --- Step 3: sign up for a new fan account ---
  await page.goto("/cadastro");
  await page.getByLabel("Nome", { exact: true }).fill(FAN_NAME);
  await page.getByLabel("E-mail", { exact: true }).fill(FAN_EMAIL);
  await page.getByLabel("Data de nascimento").fill("2000-01-01");
  await page.getByLabel("Senha", { exact: true }).fill(FAN_PASSWORD);
  await page.getByLabel("Confirmar senha").fill(FAN_PASSWORD);
  await page.getByLabel(/li e aceito os termos de uso e a política de privacidade/i).check();
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  // --- Step 4: verify the account with the fixed local/testing OTP code ---
  await expect(page).toHaveURL(new RegExp(`/verificar-email\\?email=${encodeURIComponent(FAN_EMAIL)}`));
  await page.getByLabel("Código de verificação").fill(FIXED_OTP_CODE);
  await page.getByRole("button", { name: "Verificar código" }).click();
  await expect(page.getByText("E-mail verificado!")).toBeVisible();

  // --- Step 5: log in ---
  // NavBar also has an "Entrar" link for anonymous visitors — scope to
  // <main> to target the verify-email success page's own link.
  await page.getByRole("main").getByRole("link", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/entrar");
  await page.getByLabel("E-mail").fill(FAN_EMAIL);
  await page.getByLabel("Senha").fill(FAN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();

  // --- Step 6: view the profile page ---
  await expect(page).toHaveURL("/perfil");
  await expect(page.getByLabel("Nome")).toHaveValue(FAN_NAME);
  await expect(page.getByLabel("E-mail")).toHaveValue(FAN_EMAIL);
});
