// @vitest-environment jsdom
import { createElement } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, test, expect } from "vitest";
import { InvestigatorCompanion } from "../src/components/investigator-companion";
afterEach(cleanup);
test("chosen investigator can pause, move aside, minimize and return", () => {
  const { container } = render(
    createElement(InvestigatorCompanion, { kind: "camara", stage: 1 }),
  );
  expect(screen.getByLabelText("Tu personaje: Vera")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Pausar personaje"));
  expect(container.querySelector("aside")?.getAttribute("data-paused")).toBe(
    "true",
  );
  fireEvent.click(screen.getByLabelText("Cambiar personaje de lado"));
  expect(
    container.querySelector("aside")?.classList.contains("companion-right"),
  ).toBe(true);
  fireEvent.click(screen.getByLabelText("Minimizar personaje"));
  expect(screen.queryByLabelText("Tu personaje: Vera")).toBeNull();
  fireEvent.click(screen.getByLabelText("Mostrar mi personaje"));
  expect(screen.getByLabelText("Tu personaje: Vera")).toBeTruthy();
});
