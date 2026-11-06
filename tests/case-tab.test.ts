// @vitest-environment jsdom
import { createElement } from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import { test, expect, afterEach, vi } from "vitest";
import { useCaseTab } from "../src/hooks/use-case-tab";
function Review({
  stage,
  gameId = "game",
}: {
  stage: number;
  gameId?: string;
}) {
  const { tab, setTab, voteTabRef } = useCaseTab(gameId, stage);
  return createElement(
    "div",
    null,
    createElement(
      "button",
      { ref: voteTabRef, onClick: () => setTab("suspects") },
      "Sospechosos",
    ),
    createElement(
      "button",
      { onClick: () => setTab("evidence") },
      "Evidencias",
    ),
    createElement(
      "button",
      { onClick: () => setTab("timeline") },
      "Cronología",
    ),
    createElement("output", null, tab),
  );
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
test("voting opens suspects, focuses its tab, and preserves subsequent manual clue reviews", () => {
  const scroll = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: scroll,
    configurable: true,
  });
  const view = render(createElement(Review, { stage: 1 }));
  fireEvent.click(screen.getByText("Cronología"));
  view.rerender(createElement(Review, { stage: 2 }));
  expect(screen.getByRole("status").textContent).toBe("suspects");
  expect(document.activeElement).toBe(screen.getByText("Sospechosos"));
  expect(scroll).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("Evidencias"));
  view.rerender(createElement(Review, { stage: 2 }));
  expect(screen.getByRole("status").textContent).toBe("evidence");
  expect(scroll).toHaveBeenCalledTimes(1);
  view.rerender(createElement(Review, { stage: 2, gameId: "new-game" }));
  expect(screen.getByRole("status").textContent).toBe("suspects");
});
test("loading a game already in voting opens suspects immediately", () => {
  render(createElement(Review, { stage: 2 }));
  expect(screen.getByRole("status").textContent).toBe("suspects");
});
