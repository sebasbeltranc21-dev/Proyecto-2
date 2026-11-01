// @vitest-environment jsdom
import { createElement } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { CaseArrival } from "../src/components/case-arrival";
beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
test("case arrival can be skipped and does not replay when returning to the same game", () => {
  const props = {
    gameId: "review",
    theme: "theater" as const,
    title: "Caso de revisión",
  };
  const first = render(createElement(CaseArrival, props));
  expect(first.container.querySelector("dialog")?.hasAttribute("open")).toBe(
    true,
  );
  fireEvent.click(screen.getByText("Entrar en la investigación"));
  expect(first.container.querySelector("dialog")?.hasAttribute("open")).toBe(
    false,
  );
  first.unmount();
  const second = render(createElement(CaseArrival, props));
  expect(second.container.querySelector("dialog")?.hasAttribute("open")).toBe(
    false,
  );
});
