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
  fetch: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));
vi.mock("@/lib/config", () => ({
  isConfigured: () => mocks.configured,
  supabaseConfig: () => ({
    url: "https://practice.supabase.co",
    key: "public-test-key",
  }),
}));
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
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.fetch.mockResolvedValue(
    new Response(JSON.stringify({ created: true }), { status: 201 }),
  );
  mocks.signIn.mockResolvedValue({
    data: { session: { user: { id: "practice-user" } } },
    error: null,
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("academic access offers fictional registration without anonymous sessions or email confirmation", () => {
  vi.stubEnv("NEXT_PUBLIC_ALLOW_GUESTS", "true");
  render(createElement(AuthForm));
  expect(
    screen.getByRole("button", { name: "Crear cuenta ficticia" }),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: /invitado/ })).toBeNull();
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
    "Revisa tu correo y contraseña",
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

function register(
  email = "ana@example.com",
  confirmation = "Practice-only-492!",
) {
  fireEvent.click(
    screen.getByRole("button", { name: "Crear cuenta ficticia" }),
  );
  fireEvent.change(screen.getByLabelText("Correo electrónico de práctica"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Contraseña", { exact: true }), {
    target: { value: "Practice-only-492!" },
  });
  fireEvent.change(screen.getByLabelText("Repite la contraseña"), {
    target: { value: confirmation },
  });
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Crear mi cuenta y entrar" })
      .closest("form")!,
  );
}
test("signup creates a fictional account then opens a real Auth session", async () => {
  render(createElement(AuthForm));
  register();
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/panel"));
  expect(mocks.fetch).toHaveBeenCalledWith(
    "https://practice.supabase.co/functions/v1/register-fictional",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        email: "ana@example.com",
        password: "Practice-only-492!",
      }),
    }),
  );
  expect(mocks.signIn).toHaveBeenCalledOnce();
  expect(mocks.signUp).not.toHaveBeenCalled();
});
test("signup rejects a personal email before making any account request", async () => {
  render(createElement(AuthForm));
  register("person@real-mail.com");
  expect((await screen.findByRole("alert")).textContent).toContain(
    "@example.com",
  );
  expect(mocks.fetch).not.toHaveBeenCalled();
  expect(mocks.signIn).not.toHaveBeenCalled();
});
test("signup checks password confirmation before creating an account", async () => {
  render(createElement(AuthForm));
  register("ana@example.com", "Different-password");
  expect((await screen.findByRole("alert")).textContent).toContain(
    "no coinciden",
  );
  expect(mocks.fetch).not.toHaveBeenCalled();
});
test("duplicate registration stays retryable and never signs into somebody else's account", async () => {
  mocks.fetch.mockResolvedValueOnce(
    new Response(JSON.stringify({ error: "Prueba otro correo inventado." }), {
      status: 400,
    }),
  );
  render(createElement(AuthForm));
  register();
  expect((await screen.findByRole("alert")).textContent).toContain(
    "otro correo",
  );
  expect(mocks.signIn).not.toHaveBeenCalled();
  expect(mocks.replace).not.toHaveBeenCalled();
});
test("successful signup with failed login retains the account and retries only login", async () => {
  mocks.signIn.mockResolvedValueOnce({
    data: { session: null },
    error: new Error("Network"),
  });
  render(createElement(AuthForm));
  register();
  expect((await screen.findByRole("status")).textContent).toContain(
    "Cuenta ficticia creada",
  );
  await screen.findByRole("alert");
  enter();
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/panel"));
  expect(mocks.fetch).toHaveBeenCalledOnce();
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
