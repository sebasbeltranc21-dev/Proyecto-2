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
        entry: resolve("tests/e2e/fixtures/office.tsx"),
        formats: ["iife"],
        name: "OfficeReview",
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

for(const width of [1440,390]) test(`ordered office archive and corrected Alex at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.route("**/__office-review",route=>route.fulfill({contentType:"text/html",body:html}));
 await page.goto("/__office-review");
 const cards=page.locator(".office-case-grid > .office-case");
 await expect(cards).toHaveCount(5);
 const numbers=await cards.locator(".office-case-number").allTextContents();
 expect(numbers.map(n=>n.trim())).toEqual(["EXPEDIENTE 001","EXPEDIENTE 002","EXPEDIENTE 003","EXPEDIENTE 004","EXPEDIENTE 005"]);
 await expect(page.locator(".office-seated-motion img")).toHaveAttribute("src","/characters/seated/alex-corrected.png");
 await expect.poll(()=>page.locator(".office-seated-motion img").evaluate((img)=>(img as HTMLImageElement).naturalWidth>0)).toBe(true);
 await expect(page.locator(".office-metrics")).toHaveCount(0);
 await expect(page.getByRole("link",{name:"Mis logros"})).toHaveAttribute("href","/panel/logros");
 const widths=await cards.evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
 expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(cards.first()).toHaveAttribute("href",/caso=museum/);
});
