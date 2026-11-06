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
        entry: resolve("tests/e2e/fixtures/dome.tsx"),
        formats: ["iife"],
        name: "DomeReview",
      },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!("output" in bundle)) throw new Error("Missing review bundle");
  const js = bundle.output
    .filter((o) => o.type === "chunk")
    .map((o) => o.code)
    .join("\n");
  const css = bundle.output
    .filter((o) => o.type === "asset" && o.fileName.endsWith(".css"))
    .map((o) => (o.type === "asset" ? o.source : ""))
    .join("\n");
  html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="root"></div><script>${js.replaceAll("</script>", "<\\/script>")}</script></html>`;
});
for (const theme of [
  "museum",
  "train",
  "theater",
  "lighthouse",
  "observatory",
] as const)
  for (const width of [1440, 390])
    test(`chibi cinematic loads artwork and completes manually ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.route("**/__dome-review", (route) =>
        route.fulfill({ contentType: "text/html", body: html }),
      );
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/__dome-review");
      await page.getByLabel("Caso de revisión").selectOption(theme);
      const count = theme === "train" ? 5 : 4;
      const film = page.locator(".dome-film");
      await expect(film).toHaveAttribute("data-shot", "0");
      await expect(page.locator(".chibi-suspect img")).toHaveCount(count);
      await expect
        .poll(() =>
          page
            .locator(".dome-film img")
            .evaluateAll((imgs) =>
              imgs.every((i) => (i as HTMLImageElement).naturalWidth > 0),
            ),
        )
        .toBe(true);
      await expect(page.locator(".dome-film-cast img")).toHaveCount(count);
      await expect(page.locator(".dome-film-interest")).toHaveCount(0);
      const expectedPortrait = await page
        .locator(".chibi-suspect img")
        .nth(1)
        .getAttribute("src");
      await page.getByRole("button", { name: "Siguiente escena" }).click();
      await expect(page.locator(".dome-film-interest")).toHaveAttribute(
        "src",
        expectedPortrait!,
      );
      await page.getByRole("button", { name: "Siguiente escena" }).click();
      await expect(page.locator(".dome-film-partner")).toBeVisible();
      await page.getByRole("button", { name: "Siguiente escena" }).click();
      await expect(film).toHaveAttribute("data-shot", "3");
      await expect(page.locator(".dome-film-disk")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.getByRole("button", { name: "Ver resultados" }).click();
      await expect(
        page.getByRole("heading", { name: "Resultados de revisión" }),
      ).toBeVisible();
      await expect(page.locator(".chibi-evidence .chibi-object")).toHaveCount(
        15,
      );
      expect(errors).toEqual([]);
    });

for (const width of [1440, 390])
  test(`ending returns a scrolled player to scene one at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/__dome-review", (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.goto("/__dome-review");
    await page
      .getByRole("button", { name: "Simular votación", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Cerrar caso de revisión", exact: true })
      .click();
    await expect(page.locator(".dome-film")).toHaveAttribute("data-shot", "0");
    await expect
      .poll(async () => {
        const box = await page.locator(".ending-player").boundingBox();
        return Boolean(box && box.y >= -2 && box.y < 100);
      })
      .toBe(true);
    await expect(page.locator(".ending-player h2")).toBeFocused();
  });
