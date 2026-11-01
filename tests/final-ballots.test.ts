// @vitest-environment jsdom
import { createElement } from "react";
import { render, screen, cleanup, within } from "@testing-library/react";
import { afterEach, test, expect } from "vitest";
import { FinalBallots } from "../src/components/final-ballots";
import type { RoomSnapshot } from "../src/lib/types";
afterEach(cleanup);
const data = {
  game: { stage: 3 },
  suspects: [
    { id: "guilty", name: "Mara Vidal" },
    { id: "innocent", name: "Iván Ríos" },
  ],
  solution: { suspect_id: "guilty" },
  results: [
    {
      user_id: "a",
      name: "Agente A",
      suspect_id: "guilty",
      correct: true,
      points: 100,
    },
    {
      user_id: "b",
      name: "Agente B",
      suspect_id: "innocent",
      correct: false,
      points: 0,
    },
    {
      user_id: "c",
      name: "Agente C",
      suspect_id: null,
      correct: false,
      points: 0,
    },
  ],
} as RoomSnapshot;
test("final report names the culprit and every player's actual ballot including abstention", () => {
  render(createElement(FinalBallots, { data, uid: "a" }));
  expect(screen.getByText("Culpable oficial:", { exact: false })).toBeTruthy();
  const own = screen
    .getByRole("rowheader", { name: "Agente A (tú)" })
    .closest("tr")!;
  expect(within(own).getByText("Mara Vidal")).toBeTruthy();
  const other = screen
    .getByRole("rowheader", { name: "Agente B" })
    .closest("tr")!;
  expect(within(other).getByText("Iván Ríos")).toBeTruthy();
  expect(screen.getByText("No emitió voto")).toBeTruthy();
});
test("report stays hidden during voting even if passed final-result data", () => {
  const { container } = render(
    createElement(FinalBallots, {
      data: { ...data, game: { ...data.game!, stage: 2 } },
      uid: "a",
    }),
  );
  expect(container.innerHTML).toBe("");
});
