// @vitest-environment jsdom
import { createElement } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, test, expect } from "vitest";
import { InvestigatorCompanion } from "../src/components/investigator-companion";
afterEach(cleanup);
test("chosen investigator can pause, move aside, minimize and return", () => {
  const { container } = render(
    createElement(InvestigatorCompanion, { kind: "camara" }),
  );
  expect(screen.getByLabelText("Tu personaje: Vera")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Pausar personaje"));
  expect(container.querySelector("aside")?.getAttribute("data-paused")).toBe(
    "true",
  );
  expect(container.querySelector(".companion-caption")).toBeNull();
  const mover = screen.getByLabelText("Mover mi personaje");
  fireEvent.keyDown(mover, { key: "ArrowRight" });
  expect(container.querySelector("aside")?.style.left).toBe("12px");
  fireEvent.click(screen.getByLabelText("Restablecer posición del personaje"));
  expect(container.querySelector("aside")?.style.left).toBe("");
  fireEvent.click(screen.getByLabelText("Minimizar personaje"));
  expect(screen.queryByLabelText("Mover mi personaje")).toBeNull();
  fireEvent.click(screen.getByLabelText("Mostrar mi personaje"));
  expect(screen.getByLabelText("Tu personaje: Vera")).toBeTruthy();
});
