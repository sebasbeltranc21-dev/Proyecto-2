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
import { AuthForm } from "../src/components/auth-form";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  anonymous: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  configured: true,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));
vi.mock("@/lib/config", () => ({ isConfigured: () => mocks.configured }));
vi.mock("@/lib/supabase/client", () => ({
  browserClient: () => ({
    auth: {
      signInWithPassword: mocks.signIn,
      signUp: mocks.signUp,
      signInAnonymously: mocks.anonymous,
    },
  }),
}));

function enter() {
  fireEvent.change(screen.getByLabelText("Correo electrónico de práctica"), {
    target: { value: "ana@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "Practice-only-492!" },
  });
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Entrar al expediente" })
      .closest("form")!,
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.configured = true;
  mocks.signIn.mockResolvedValue({
    data: { session: { user: { id: "practice-user" } } },
    error: null,
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

test("academic access offers existing practice accounts without registration or anonymous sessions", () => {
  vi.stubEnv("NEXT_PUBLIC_ALLOW_GUESTS", "true");
  render(createElement(AuthForm));
  expect(screen.queryByRole("button", { name: /Crear|invitado/ })).toBeNull();
  expect(screen.getByText(/son ejemplos y deben crearse/)).toBeTruthy();
  expect(mocks.signUp).not.toHaveBeenCalled();
  expect(mocks.anonymous).not.toHaveBeenCalled();
});

test("a fictional account signs in through Supabase before opening its saved panel", async () => {
  render(createElement(AuthForm));
  enter();
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/panel"));
  expect(mocks.signIn).toHaveBeenCalledExactlyOnceWith({
    email: "ana@example.com",
    password: "Practice-only-492!",
  });
  expect(mocks.refresh).toHaveBeenCalledOnce();
  expect(mocks.signUp).not.toHaveBeenCalled();
  expect(mocks.anonymous).not.toHaveBeenCalled();
});

test("a failed login preserves the fictional email and allows retry without sending email", async () => {
  mocks.signIn.mockResolvedValueOnce({
    data: { session: null },
    error: new Error("Invalid credentials"),
  });
  render(createElement(AuthForm));
  enter();
  expect((await screen.findByRole("alert")).textContent).toContain(
    "creada y confirmada",
  );
  expect(
    (
      screen.getByLabelText(
        "Correo electrónico de práctica",
      ) as HTMLInputElement
    ).value,
  ).toBe("ana@example.com");
  expect(mocks.replace).not.toHaveBeenCalled();
  enter();
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/panel"));
  expect(mocks.signUp).not.toHaveBeenCalled();
});

test("an empty Auth response never fabricates a session", async () => {
  mocks.signIn.mockResolvedValueOnce({ data: { session: null }, error: null });
  render(createElement(AuthForm));
  enter();
  await screen.findByRole("alert");
  expect(mocks.replace).not.toHaveBeenCalled();
});

test("access is disabled when Supabase is not configured", () => {
  mocks.configured = false;
  render(createElement(AuthForm));
  expect(
    (
      screen.getByRole("button", {
        name: "Entrar al expediente",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(mocks.signIn).not.toHaveBeenCalled();
});
