// @vitest-environment jsdom
import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { EvidenceWorkspace } from "../src/components/evidence-workspace";
import type { RoomSnapshot } from "../src/lib/types";
const uid = "30000000-0000-4000-8000-000000000001";
const publicId = "50000000-0000-4000-8000-000000000001";
const privateId = "50000000-0000-4000-8000-000000000002";
const data: RoomSnapshot = {
  room: {
    id: "room",
    code: "A1B2C3D4",
    host_id: uid,
    status: "active",
    allow_guests: false,
    minutes: 5,
    vote_minutes: 2,
  },
  game: {
    id: "game",
    stage: 0,
    phase_ends_at: "2026-10-23T23:50:00Z",
    success: false,
    team_suspect: null,
  },
  case: {
    slug: "expreso-medianoche",
    theme: "train",
    title: "El Expreso Medianoche",
    intro: "El tren se detuvo.",
    stages: [],
    locations: [
      {
        id: "lounge",
        key: "lounge",
        name: "Salón",
        description: "Ventanas y reloj.",
        stage: 0,
      },
      {
        id: "service",
        key: "service",
        name: "Servicio",
        description: "El pasillo de servicio.",
        stage: 0,
      },
      {
        id: "cab",
        key: "cab",
        name: "Cabina",
        description: "Registro técnico.",
        stage: 1,
      },
    ],
  },
  participants: [
    {
      user_id: uid,
      name: "Agente Uno",
      avatar: "lupa",
      ready: true,
      last_seen: "2026-10-23T23:40:00Z",
      in_game: true,
    },
  ],
  suspects: [],
  evidence: [
    {
      id: publicId,
      title: "El reloj de a bordo",
      body: "La parada quedó registrada a las 23:40.",
      user_id: null,
      stage: 0,
      location_id: "lounge",
    },
    {
      id: privateId,
      title: "La cámara del pasillo",
      body: "Una figura aparece en el reflejo.",
      user_id: uid,
      stage: 0,
      location_id: "service",
    },
  ],
  timeline: [],
  messages: [],
  my_vote: null,
  vote_count: 0,
  results: [],
  solution: null,
  server_now: "2026-10-23T23:40:00Z",
};
const action = vi.fn();
const timeline = vi.fn();
function show(
  value = data,
  mode: "evidence" | "timeline" = "evidence",
  error = "",
) {
  return render(
    createElement(EvidenceWorkspace, {
      data: value,
      uid,
      mode,
      busy: false,
      error,
      onAction: action,
      onTimeline: timeline,
    }),
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  action.mockResolvedValue(true);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function () {
      this.setAttribute("open", "");
    },
  });
});
afterEach(cleanup);
test("map filters only available evidence and keeps locked carriages unavailable", () => {
  show();
  expect(
    (screen.getByRole("button", { name: /Cabina/ }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: /Salón/ }));
  expect(
    screen.getByRole("heading", { name: "El reloj de a bordo" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("heading", { name: "La cámara del pasillo" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Ver todas las pistas" }));
  expect(
    screen.getByRole("heading", { name: "La cámara del pasillo" }),
  ).toBeTruthy();
  expect(action).not.toHaveBeenCalled();
});
test("a private clue cannot be shared until the player confirms full disclosure", async () => {
  show();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Examinar evidencia: La cámara del pasillo",
    }),
  );
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Hora propuesta"), {
    target: { value: "23:37" },
  });
  const share = within(dialog).getByRole("button", {
    name: "Compartir en la cronología",
  }) as HTMLButtonElement;
  expect(share.disabled).toBe(true);
  fireEvent.click(within(dialog).getByRole("checkbox"));
  expect(share.disabled).toBe(false);
  fireEvent.click(share);
  await waitFor(() =>
    expect(action).toHaveBeenCalledExactlyOnceWith({
      action: "timeline_pin",
      code: "A1B2C3D4",
      evidence: privateId,
      minute: 1417,
      sharePrivate: true,
    }),
  );
  await waitFor(() => expect(timeline).toHaveBeenCalledOnce());
  expect(screen.queryByRole("dialog")).toBeNull();
});
test("sharing failures keep the enlarged evidence open with a visible error", async () => {
  action.mockResolvedValue(false);
  const shown = show();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Examinar evidencia: El reloj de a bordo",
    }),
  );
  fireEvent.change(screen.getByLabelText("Hora propuesta"), {
    target: { value: "23:40" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Compartir en la cronología" }),
  );
  await waitFor(() => expect(action).toHaveBeenCalledOnce());
  shown.rerender(
    createElement(EvidenceWorkspace, {
      data,
      uid,
      mode: "evidence",
      busy: false,
      error: "La conexión falló.",
      onAction: action,
      onTimeline: timeline,
    }),
  );
  expect(
    within(screen.getByRole("dialog")).getByRole("alert").textContent,
  ).toContain("La conexión falló.");
  expect(timeline).not.toHaveBeenCalled();
});
test("voting leaves evidence readable and makes the board read-only", () => {
  const value = {
    ...data,
    game: { ...data.game!, stage: 2 },
    timeline: [
      {
        id: "entry",
        evidence_id: publicId,
        user_id: uid,
        name: "Agente Uno",
        minute: 1420,
        title: "El reloj de a bordo",
        body: "Registro compartido.",
        shared_private: false,
      },
    ],
  };
  show(value, "timeline");
  expect(screen.getByText("23:40")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Cambiar hora" })).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Retirar del tablero" }),
  ).toBeNull();
  cleanup();
  show(value);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Examinar evidencia: El reloj de a bordo",
    }),
  );
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.queryByLabelText("Hora propuesta")).toBeNull();
});
