// @vitest-environment jsdom
import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { HomeSnapshot } from "../src/lib/types";
import { Dashboard } from "../src/components/dashboard";
const mocks = vi.hoisted(() => ({
  act: vi.fn(),
  rpc: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
    refresh: mocks.refresh,
  }),
}));
vi.mock("@/lib/api", () => ({ act: mocks.act }));
vi.mock("@/lib/supabase/client", () => ({
  browserClient: () => ({ rpc: mocks.rpc }),
}));
const profile = {
  id: "30000000-0000-4000-8000-000000000001",
  name: "Nora",
  avatar: "lupa",
};
const home: HomeSnapshot = {
  cases: [
    {
      slug: "ultima-luz",
      title: "La última luz del museo",
      intro: "Una joya desaparecida.",
      theme: "museum",
      suspect_count: 4,
    },
  ],
  profile: null,
  rooms: [],
  history: [],
  stats: { games: 0, correct: 0, points: 0 },
  leaderboard: [],
};
function show(data = home) {
  return render(
    createElement(Dashboard, {
      anonymous: false,
      initialData: data,
      initialError: "",
    }),
  );
}
function enterCode() {
  fireEvent.change(screen.getByLabelText("Código de invitación"), {
    target: { value: "29551bf7" },
  });
}
function joinButton() {
  return screen.getByRole("button", {
    name: "Entrar a la sala",
  }) as HTMLButtonElement;
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.act.mockImplementation(async (value: { action: string }) =>
    value.action === "join" ? { code: "29551BF7" } : {},
  );
  mocks.rpc.mockResolvedValue({ data: { ...home, profile }, error: null });
});
afterEach(cleanup);
test("new player can save their name and join from the invitation form", async () => {
  show();
  expect(joinButton().disabled).toBe(false);
  enterCode();
  fireEvent.change(screen.getByLabelText("Nombre visible"), {
    target: { value: "  Nora  " },
  });
  expect(
    (screen.getByLabelText("Nombre para entrar") as HTMLInputElement).value,
  ).toBe("  Nora  ");
  fireEvent.click(joinButton());
  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledWith("/sala/29551BF7"),
  );
  expect(mocks.act.mock.calls.map((call) => call[0])).toEqual([
    { action: "profile", name: "Nora", avatar: "lupa" },
    { action: "join", code: "29551BF7" },
  ]);
});
test("existing player joins without overwriting the saved profile", async () => {
  show({ ...home, profile });
  expect(joinButton().disabled).toBe(false);
  expect(screen.queryByLabelText("Nombre para entrar")).toBeNull();
  enterCode();
  fireEvent.click(joinButton());
  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledWith("/sala/29551BF7"),
  );
  expect(mocks.act).toHaveBeenCalledExactlyOnceWith({
    action: "join",
    code: "29551BF7",
  });
});
test("the selected case is submitted when creating a room", async () => {
  mocks.act.mockResolvedValueOnce({ code: "A1B2C3D4" });
  show({
    ...home,
    profile,
    cases: [
      ...home.cases,
      {
        slug: "expreso-medianoche",
        title: "El Expreso Medianoche",
        intro: "Un tren detenido.",
        theme: "train",
        suspect_count: 5,
      },
    ],
  });
  expect(screen.queryByLabelText("Permitir invitados")).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: /El Expreso Medianoche/ }));
  fireEvent.click(screen.getByRole("button", { name: "Crear sala" }));
  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledWith("/sala/A1B2C3D4"),
  );
  expect(mocks.act).toHaveBeenCalledExactlyOnceWith({
    action: "create",
    caseSlug: "expreso-medianoche",
    minutes: 5,
    voteMinutes: 2,
    allowGuests: false,
  });
});
test("blank names show an error beside the invitation and do not send a join request", async () => {
  show();
  enterCode();
  fireEvent.change(screen.getByLabelText("Nombre para entrar"), {
    target: { value: "   " },
  });
  fireEvent.click(joinButton());
  const error = await screen.findByRole("alert");
  expect(error.textContent).toContain("Escribe un nombre");
  expect(
    screen.getByRole("form", { name: "Unirse a una sala" }).contains(error),
  ).toBe(true);
  expect(mocks.act).not.toHaveBeenCalled();
  expect(joinButton().disabled).toBe(false);
});
test("failed profile save keeps the form retryable without attempting to join", async () => {
  mocks.act.mockRejectedValueOnce(new Error("No se pudo guardar el perfil."));
  show();
  enterCode();
  fireEvent.change(screen.getByLabelText("Nombre para entrar"), {
    target: { value: "Nora" },
  });
  fireEvent.click(joinButton());
  expect((await screen.findByRole("alert")).textContent).toContain(
    "No se pudo guardar el perfil.",
  );
  expect(mocks.act).toHaveBeenCalledTimes(1);
  expect(joinButton().disabled).toBe(false);
  expect(mocks.push).not.toHaveBeenCalled();
});
test("failed join preserves the code and retries with the now-saved profile", async () => {
  mocks.act
    .mockResolvedValueOnce({})
    .mockRejectedValueOnce(new Error("No se encontró esa sala."))
    .mockResolvedValueOnce({ code: "29551BF7" });
  show();
  enterCode();
  fireEvent.change(screen.getByLabelText("Nombre para entrar"), {
    target: { value: "Nora" },
  });
  fireEvent.click(joinButton());
  expect((await screen.findByRole("alert")).textContent).toContain(
    "No se encontró esa sala.",
  );
  expect(
    (screen.getByLabelText("Código de invitación") as HTMLInputElement).value,
  ).toBe("29551bf7");
  expect(screen.queryByLabelText("Nombre para entrar")).toBeNull();
  expect(joinButton().disabled).toBe(false);
  fireEvent.click(joinButton());
  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledWith("/sala/29551BF7"),
  );
  expect(mocks.act.mock.calls.map((call) => call[0].action)).toEqual([
    "profile",
    "join",
    "join",
  ]);
});

test("the fifth character is sent when saving the profile", async () => {
  show();
  fireEvent.change(screen.getByLabelText("Nombre visible"), {
    target: { value: "Agente Vera" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Elegir a Vera, Fotógrafa" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }));
  await waitFor(() =>
    expect(mocks.act).toHaveBeenCalledWith({
      action: "profile",
      name: "Agente Vera",
      avatar: "camara",
    }),
  );
});
