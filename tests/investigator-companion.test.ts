// @vitest-environment jsdom
import { createElement } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, test, expect } from "vitest";
import { InvestigatorCompanion } from "../src/components/investigator-companion";
afterEach(cleanup);
test("chosen investigator remains anchored while animation can pause and resume", () => {
  const { container } = render(
    createElement(InvestigatorCompanion, { kind: "camara" }),
  );
  const character = screen.getByLabelText("Tu personaje: Vera");
  expect(screen.queryByLabelText("Mover mi personaje")).toBeNull();
  expect(screen.queryByLabelText("Minimizar personaje")).toBeNull();
  fireEvent.keyDown(character, { key: "ArrowRight" });
  expect(character.style.left).toBe("");
  fireEvent.click(screen.getByLabelText("Pausar personaje de cabecera"));
  expect(container.querySelector("aside")?.getAttribute("data-paused")).toBe(
    "true",
  );
  fireEvent.click(screen.getByLabelText("Animar personaje de cabecera"));
  expect(container.querySelector("aside")?.getAttribute("data-paused")).toBe(
    "false",
  );
});
