// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import {
  SuspectPortrait,
  EvidenceIllustration,
} from "../src/components/case-art";
import { chibiCharacter } from "../src/lib/chibi-characters";

test("shared legacy roles preserve different chibi identities by name", () => {
  for (const [a, b, portrait] of [
    ["Clara Vidal", "Celia Mora", "restorer"],
    ["Elena Cruz", "Mateo Roca", "conductor"],
    ["Tomás León", "Celia Vela", "mechanic"],
    ["Mateo Ríos", "Mara Vidal", "collector"],
  ]) {
    const first = chibiCharacter(a, portrait),
      second = chibiCharacter(b, portrait);
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.image).not.toBe(second?.image);
    const html = renderToStaticMarkup(
      createElement(SuspectPortrait, { id: "arbitrary-id", name: b, portrait }),
    );
    expect(html).toContain(encodeURIComponent(second!.image));
    expect(html).not.toContain("portrait-drawing");
  }
  expect(chibiCharacter(undefined, "dome-lia")?.name).toBe("Lía Ravel");
  expect(chibiCharacter("toString", "constructor")).toBeUndefined();
});

test("decorative chibi evidence never adds clue contents or synthetic identifying details", () => {
  const html = renderToStaticMarkup(
    createElement(EvidenceIllustration, { title: "La tarjeta M-3" }),
  );
  expect(html).toContain('data-object="credential"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain("M-3");
  expect(html).not.toContain("Mara");
  const fallback = renderToStaticMarkup(
    createElement(EvidenceIllustration, { title: "Evidencia desconocida" }),
  );
  expect(fallback).toContain('data-object="file"');
});
