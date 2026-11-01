import { expect, test, type Page } from "@playwright/test";
import { createConfirmedUser, deleteUser, hasSupabase } from "./support";

test.describe("public pages", () => {
  test("landing leads to register and login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Tennis\s*Mabar/ })).toBeVisible();
    await page.getByRole("link", { name: "Get Started" }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("app pages send guests to login and remember where they were going", async ({ page }) => {
    await page.goto("/mabar");
    await expect(page).toHaveURL(/\/login\?next=%2Fmabar/);
  });

  test("no horizontal overflow on the landing page", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

async function onboard(page: Page, name: string, answers: [string, string, string]) {
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByLabel("Nama panggilan").fill(name);
  await page.getByLabel("Area main").selectOption({ label: "Jakarta Selatan" });
  await page.getByRole("button", { name: "Lanjut" }).click();
  await page.getByRole("button", { name: "Lanjut" }).click();
  for (const answer of answers) await page.getByText(answer, { exact: true }).click();
  await page.getByRole("button", { name: "Tentukan Level Saya" }).click();
  await expect(page.getByText("Level kamu")).toBeVisible();
}

// Critical path for this iteration (match results and rating arrive next).
test.describe("core loop", () => {
  test.skip(!hasSupabase, "Needs a Supabase project in .env.local");
  test.describe.configure({ mode: "serial" });

  const users: string[] = [];
  test.afterAll(async () => Promise.all(users.map(deleteUser)));

  test("organizer creates a mabar, a second player finds and joins it", async ({ browser }) => {
    const organizer = await createConfirmedUser();
    const player = await createConfirmedUser();
    users.push(organizer.id, player.id);
    const title = `E2E Mabar ${Date.now()}`;

    // Organizer: onboard → create.
    const orgPage = await (await browser.newContext()).newPage();
    await login(orgPage, organizer.email, organizer.password);
    await onboard(orgPage, "Organizer", ["> 1 tahun", "Cukup konsisten", "Friendly"]);
    await orgPage.goto("/mabar/new");
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    await orgPage.getByLabel("Tanggal", { exact: true }).fill(tomorrow);
    await orgPage.getByLabel("Lokasi").selectOption({ label: "Kemang Tennis Club" });
    await orgPage.getByLabel("Nama mabar").fill(title);
    await orgPage.getByRole("button", { name: "Create Mabar" }).click();
    await expect(orgPage).toHaveURL(/\/mabar\/[0-9a-f-]{36}$/);
    await expect(orgPage.getByRole("heading", { name: title })).toBeVisible();

    // Player: onboard → find → detail → join → see it on Home.
    const page = await (await browser.newContext()).newPage();
    await login(page, player.email, player.password);
    await onboard(page, "Player", ["> 1 tahun", "Cukup konsisten", "Friendly"]);
    await page.goto(`/mabar?q=${encodeURIComponent(title)}`);
    await page.getByRole("link", { name: title }).click();
    await page.getByRole("button", { name: "Join This Match" }).click();
    await expect(page.getByText("Sudah join", { exact: true })).toBeVisible();
    await expect(page.getByText("2 / 4")).toBeVisible();

    await page.goto("/home");
    await expect(page.getByRole("link", { name: title })).toBeVisible();
  });
});
