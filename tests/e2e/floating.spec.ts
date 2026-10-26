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
  html = `<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--gold:#c8a76b;--line:#3c4f60}body{margin:0;background:#101923;color:#eee8dc;font:15px Arial}main{min-height:1800px}button{font:inherit}*{box-sizing:border-box}${css}</style><div id="root"></div><script>${js.replaceAll("</script>", "<\\/script>")}</script></html>`;
});
for (const width of [1440, 390])
  test(`floating overlays move and preserve chat drafts at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/__floating-review", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.goto("/__floating-review");
    const character = page.getByLabel("Mover mi personaje", { exact: true });
    await expect(character).toBeVisible();
    await expect(page.locator(".companion-caption")).toHaveCount(0);
    const before = await character.boundingBox();
    if (!before) throw new Error("Missing character");
    await page.mouse.move(before.x + before.width / 2, before.y + 20);
    await page.mouse.down();
    await page.mouse.move(180, 180, { steps: 8 });
    await page.mouse.up();
    const after = await character.boundingBox();
    expect(after?.y).toBeLessThan(before.y);
    const icon = page.getByRole("button", {
      name: "Abrir chat del equipo",
      exact: true,
    });
    await icon.click();
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
    await icon.click();
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
