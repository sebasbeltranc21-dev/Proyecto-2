import { test, expect } from "@playwright/test";
import { build } from "vite";
import { resolve } from "node:path";
let html = "";
test.beforeAll(async () => {
  const result = await build({
    configFile: false,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    logLevel: "silent",
    resolve: {
      alias: {
        "@": resolve("src"),
        "next/image": resolve("tests/e2e/fixtures/image.tsx"),
        "next/link": resolve("tests/e2e/fixtures/link.tsx"),
      },
    },
    build: {
      write: false,
      minify: false,
      lib: {
        entry: resolve("tests/e2e/fixtures/floating.tsx"),
        formats: ["iife"],
        name: "FloatingReview",
      },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!("output" in bundle))
    throw new Error("Expected in-memory fixture build");
  const js = bundle.output
    .filter((o) => o.type === "chunk")
    .map((o) => o.code)
    .join("\n");
  const css = bundle.output
    .filter((o) => o.type === "asset" && o.fileName.endsWith(".css"))
    .map((o) => (o.type === "asset" ? o.source : ""))
    .join("\n");
  html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--gold:#c8a76b;--line:#3c4f60}body{margin:0;background:#101923;color:#eee8dc;font:15px Arial}main{min-height:1800px}button{font:inherit}*{box-sizing:border-box}${css}</style><div id="root"></div><script>${js.replaceAll("</script>", "<\\/script>")}</script></html>`;
});
for (const width of [1440, 390])
  test(`anchored characters, visible result portraits and docked chat at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/__floating-review", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/__floating-review");
    await expect.poll(() => errors).toEqual([]);
    const character = page.getByLabel("Tu personaje: Álex", { exact: true });
    await expect(character).toBeVisible();
    await expect(
      page.locator(".office-stage a, .office-stage button"),
    ).toHaveCount(0);
    await expect(page.locator(".office-portrait")).toHaveCount(0);
    await expect(
      page.getByAltText("Álex sentado investigando", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Pausar personaje", exact: true })
      .first()
      .click();
    await expect(page.locator(".office-seated-detective")).toHaveAttribute(
      "data-paused",
      "true",
    );
    await expect(
      page.getByRole("link", { name: "Mis expedientes", exact: true }),
    ).toHaveAttribute("href", "/panel/expedientes");
    await expect(
      page.getByRole("link", { name: /Teléfono de la central/ }),
    ).toHaveAttribute("href", "#unirse");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(
      page.getByRole("table", {
        name: "Votos y resultados de todos los investigadores",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Agente ficticio A (tú)" }),
    ).toBeVisible();
    await expect(
      page.getByText("No emitió voto", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".companion-caption")).toHaveCount(0);
    await expect(
      page.getByLabel("Mover mi personaje", { exact: true }),
    ).toHaveCount(0);
    const portrait = page.locator(".solution .chibi-suspect");
    await expect
      .poll(async () => (await portrait.boundingBox())?.height ?? 0)
      .toBeGreaterThan(100);
    await expect
      .poll(() =>
        portrait
          .locator("img")
          .evaluate((img) => (img as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);
    const icon = page.getByRole("button", {
      name: "Abrir chat del equipo",
      exact: true,
    });
    await icon.click();
    await expect(page.locator(".chat-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await page
      .getByRole("textbox", { name: "Tu teoría" })
      .fill("Teoría pendiente");
    const handle = page.getByRole("button", {
      name: "Mover chat",
      exact: true,
    });
    await handle.focus();
    await page.keyboard.press("ArrowUp");
    await page
      .getByRole("button", { name: "Minimizar chat", exact: true })
      .click();
    const dock = await page.locator(".floating-chat").boundingBox();
    expect(dock!.y + dock!.height).toBeGreaterThan(810);
    expect(dock!.x + dock!.width).toBeGreaterThan(width - 30);
    await icon.click();
    await expect(page.locator(".chat-message-avatar")).toHaveCount(2);
    await expect(page.locator(".chat-message-avatar").first()).toHaveAttribute(
      "src",
      "/characters/vera.webp",
    );
    await expect(page.getByRole("textbox", { name: "Tu teoría" })).toHaveValue(
      "Teoría pendiente",
    );
    await page.setViewportSize({ width: 320, height: 550 });
    await expect
      .poll(async () => {
        const box = await page.locator(".floating-chat").boundingBox();
        return Boolean(
          box &&
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= 321 &&
          box.y + box.height <= 551,
        );
      })
      .toBe(true);
  });
