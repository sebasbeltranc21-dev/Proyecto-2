// @vitest-environment jsdom
import { createElement } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, test, expect, vi } from "vitest";
import { FloatingChat } from "../src/components/floating-chat";
import { clampPosition } from "../src/hooks/use-floating-position";
afterEach(cleanup);
test("chat minimizes without losing its draft and counts incoming messages", () => {
  const children = createElement("textarea", { "aria-label": "Draft" });
  const { rerender } = render(
    createElement(FloatingChat, { messageCount: 2 }, children),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Abrir chat del equipo" }),
  );
  fireEvent.change(screen.getByLabelText("Draft"), {
    target: { value: "Una teoría por terminar" },
  });
  fireEvent.click(screen.getByLabelText("Minimizar chat"));
  rerender(createElement(FloatingChat, { messageCount: 4 }, children));
  fireEvent.click(
    screen.getByRole("button", {
      name: "Abrir chat del equipo, 2 mensajes nuevos",
    }),
  );
  expect((screen.getByLabelText("Draft") as HTMLTextAreaElement).value).toBe(
    "Una teoría por terminar",
  );
  expect(screen.queryByText("2")).toBeNull();
});
test("dragging uses pointer capture and stays inside the viewport after resizing", () => {
  // jsdom does not implement PointerEvent or layout; supply browser geometry.
  class TestPointer extends MouseEvent {
    pointerId = 1;
    isPrimary = true;
  }
  vi.stubGlobal("PointerEvent", TestPointer);
  const { container } = render(
    createElement(FloatingChat, { messageCount: 0 }, "Messages"),
  );
  const root = container.querySelector("section")!;
  vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
    left: 20,
    top: 30,
    width: 360,
    height: 400,
    right: 380,
    bottom: 430,
    x: 20,
    y: 30,
    toJSON() {},
  });
  const toggle = screen.getByRole("button", { name: "Abrir chat del equipo" });
  toggle.setPointerCapture = vi.fn();
  toggle.hasPointerCapture = () => true;
  toggle.releasePointerCapture = vi.fn();
  fireEvent.pointerDown(toggle, { clientX: 30, clientY: 40, button: 0 });
  fireEvent.pointerMove(toggle, { clientX: 2000, clientY: 2000 });
  fireEvent.pointerUp(toggle);
  expect(root.style.left).toBe(`${window.innerWidth - 368}px`);
  expect(root.style.top).toBe(`${window.innerHeight - 408}px`);
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  vi.unstubAllGlobals();
});
test("bounds fit both edges and narrow screens", () => {
  expect(clampPosition({ x: 999, y: 999 }, 100, 120, 390, 844)).toEqual({
    x: 282,
    y: 716,
  });
  expect(clampPosition({ x: -20, y: -10 }, 100, 120, 390, 844)).toEqual({
    x: 8,
    y: 8,
  });
});
