// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { CaseEnding } from "../src/components/ending-cinematic";
import type { RoomSnapshot } from "../src/lib/types";
let reduced = false,
  pageVisible = true;
function snapshot(
  theme: "museum" | "train" = "museum",
  success = true,
  team: string | null = "official",
): RoomSnapshot {
  return {
    room: {
      id: "room",
      code: "A1B2C3D4",
      host_id: "agent",
      status: "finished",
      allow_guests: false,
      minutes: 1,
      vote_minutes: 1,
    },
    game: {
      id: "game-finale",
      stage: 3,
      phase_ends_at: "2026-10-23T23:40:00Z",
      success,
      team_suspect: team,
    },
    case: {
      slug: theme === "train" ? "expreso-medianoche" : "ultima-luz",
      theme,
      title:
        theme === "train" ? "El Expreso Medianoche" : "La última luz del museo",
      intro: "Caso de prueba.",
      locations: [],
      stages: [],
    },
    suspects: [
      {
        id: "official",
        name: "Persona oficial",
        description: "Descripción",
        motive: "Motivo",
        alibi: "Coartada",
        portrait: theme === "train" ? "conductor" : "restorer",
      },
      {
        id: "other",
        name: "Otra persona",
        description: "Descripción",
        motive: "Motivo",
        alibi: "Coartada",
      },
    ],
    participants: [],
    evidence: [],
    timeline: [],
    messages: [],
    my_vote: null,
    vote_count: 2,
    results: [],
    solution: { suspect_id: "official", explanation: "Explicación oficial." },
    server_now: "2026-10-23T23:40:00Z",
  };
}
function show(data = snapshot(), uid = "agent") {
  return render(
    createElement(
      CaseEnding,
      { data, uid },
      createElement("h2", null, "Resultados de prueba"),
    ),
  );
}
function advance() {
  act(() => vi.advanceTimersByTime(3500));
}
beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  reduced = false;
  pageVisible = true;
  vi.stubGlobal("matchMedia", () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() =>
    pageVisible ? "visible" : "hidden",
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
test("no cinematic or culprit is mounted before closure or without an official solution", () => {
  const data = snapshot();
  data.game!.stage = 2;
  const view = show(data);
  expect(screen.queryByRole("region", { name: "Cinemática final" })).toBeNull();
  expect(
    screen.getByRole("heading", { name: "Resultados de prueba" }),
  ).toBeTruthy();
  expect(document.body.textContent).not.toContain("Persona oficial");
  view.unmount();
  show({ ...snapshot(), solution: null });
  expect(screen.queryByRole("region", { name: "Cinemática final" })).toBeNull();
});
for (const theme of ["museum", "train"] as const) {
  test(`${theme}: successful final escorts the official culprit and completes after fourteen seconds`, () => {
    const view = show(snapshot(theme));
    expect(
      screen.queryByRole("heading", { name: "Resultados de prueba" }),
    ).toBeNull();
    advance();
    expect(screen.getByRole("status").textContent).toContain("Persona oficial");
    // Realtime snapshots recreate objects; they must not restart the timer.
    view.rerender(
      createElement(
        CaseEnding,
        { data: { ...snapshot(theme) }, uid: "agent" },
        createElement("h2", null, "Resultados de prueba"),
      ),
    );
    advance();
    expect(document.querySelector('[data-detained="true"]')).toBeTruthy();
    advance();
    expect(screen.getByRole("status").textContent).toContain("bajo custodia");
    advance();
    expect(
      screen.getByRole("heading", { name: "Resultados de prueba" }),
    ).toBeTruthy();
    expect(sessionStorage.getItem("mm:ending:v1:agent:game-finale")).toBe(
      "seen",
    );
  });
}
test("wrong accusations and tied/no-vote outcomes never depict a detention", () => {
  for (const team of ["other", null]) {
    const view = show(snapshot("train", false, team), "agent-" + String(team));
    for (let i = 0; i < 4; i++) {
      expect(document.querySelector('[data-detained="true"]')).toBeNull();
      if (i === 1)
        expect(screen.getByRole("status").textContent).toContain(
          team ? "Otra persona" : "sin una acusación única",
        );
      if (i === 3)
        expect(screen.getByRole("status").textContent).toContain(
          "Persona oficial",
        );
      advance();
    }
    view.unmount();
  }
});
test("skip persists for this user and game, and replay starts at the first scene", () => {
  const view = show();
  fireEvent.click(screen.getByRole("button", { name: "Omitir cinemática" }));
  expect(
    screen.getByRole("heading", { name: "Resultados de prueba" }),
  ).toBeTruthy();
  view.unmount();
  show();
  expect(screen.queryByRole("region", { name: "Cinemática final" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Volver a ver la cinemática" }),
  );
  expect(screen.getByRole("status").textContent).toContain(
    "La sala queda en silencio",
  );
  fireEvent.click(screen.getByRole("button", { name: "Omitir cinemática" }));
  cleanup();
  show(snapshot(), "another-agent");
  expect(screen.getByRole("region", { name: "Cinemática final" })).toBeTruthy();
});
test("pause and hidden tabs preserve the current scene", () => {
  show();
  fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
  act(() => vi.advanceTimersByTime(20000));
  expect(screen.getByRole("status").textContent).toContain(
    "La sala queda en silencio",
  );
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
  advance();
  expect(screen.getByRole("status").textContent).toContain(
    "Las pruebas señalan",
  );
  act(() => {
    pageVisible = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  act(() => vi.advanceTimersByTime(20000));
  expect(screen.getByRole("status").textContent).toContain(
    "Las pruebas señalan",
  );
  act(() => {
    pageVisible = true;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  advance();
  expect(screen.getByRole("status").textContent).toContain(
    "Los agentes cierran",
  );
});
test("reduced motion offers a static storyboard advanced at the player pace", () => {
  reduced = true;
  show();
  act(() => vi.advanceTimersByTime(30000));
  expect(screen.getByRole("status").textContent).toContain(
    "La sala queda en silencio",
  );
  expect(screen.queryByRole("button", { name: "Pausar" })).toBeNull();
  for (let i = 0; i < 3; i++)
    fireEvent.click(screen.getByRole("button", { name: "Siguiente escena" }));
  fireEvent.click(screen.getByRole("button", { name: "Ver resultados" }));
  expect(
    screen.getByRole("heading", { name: "Resultados de prueba" }),
  ).toBeTruthy();
});
test("unavailable session storage never blocks skipping or viewing the results", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Blocked");
  });
  show();
  fireEvent.click(screen.getByRole("button", { name: "Omitir cinemática" }));
  expect(
    screen.getByRole("heading", { name: "Resultados de prueba" }),
  ).toBeTruthy();
});
