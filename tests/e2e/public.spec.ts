import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`landing navigation, accessibility and layout at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "La verdad estáentre vosotros.",
    );
    await expect(page.locator("img").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const a11y = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(a11y.violations).toEqual([]);
    await page.screenshot({
      path: `/tmp/modo-misterio-${viewport.width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("link", { name: "Cómo jugar" })
      .isVisible()
      .then(async (visible) => {
        if (visible) {
          await page.getByRole("link", { name: "Cómo jugar" }).click();
          await expect(page).toHaveURL(/#como-jugar$/);
        }
      });
    await page
      .getByRole("link", { name: "Crear una sala", exact: true })
      .click();
    if (!configured)
      await expect(page.getByRole("status")).toContainText(
        "Conexión pendiente",
      );
    expect(errors).toEqual([]);
  });
}
test("missing configuration is explicit and does not fabricate a session", async ({
  page,
  request,
}) => {
  test.skip(configured, "Requires a build without Supabase variables.");
  await page.goto("/acceso");
  await expect(
    page.getByRole("button", { name: "Entrar al expediente" }),
  ).toBeDisabled();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  const response = await request.post("/api/action", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { action: "create", minutes: 5, voteMinutes: 2, allowGuests: false },
  });
  expect(response.status()).toBe(503);
  const forbidden = await request.post("/api/action", {
    headers: { origin: "https://other.example" },
    data: {},
  });
  expect(forbidden.status()).toBe(403);
});
test("invalid room and unknown page have recoverable 404 states", async ({
  page,
}) => {
  const response = await page.goto("/sala/invalid");
  expect([200, 404]).toContain(response?.status());
  await expect(page.getByRole("link", { name: "Ir al panel" })).toBeVisible();
  const missing = await page.goto("/expediente-inexistente");
  expect(missing?.status()).toBe(404);
});
