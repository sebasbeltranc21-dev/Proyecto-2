import { beforeEach, expect, test, vi } from "vitest";
import { registrationHandler } from "../supabase/functions/register-fictional/index";
const fetcher = vi.fn<typeof fetch>();
const handler = registrationHandler({
  url: "https://test.supabase.co",
  adminKey: "server-secret",
  publishableKeys: ["public-key"],
  fetcher,
});
function request(
  body: unknown = { email: "test@example.com", password: "Practice-only-492!" },
  headers = {},
) {
  return new Request(
    "https://test.supabase.co/functions/v1/register-fictional",
    {
      method: "POST",
      headers: {
        apikey: "public-key",
        origin: "https://proyecto-2-rho.vercel.app",
        ...headers,
      },
      body: JSON.stringify(body),
    },
  );
}
beforeEach(() => {
  fetcher.mockReset();
  fetcher.mockImplementation(
    async (url) =>
      new Response(
        JSON.stringify(
          String(url).includes("/rpc/") ? true : { id: "new-user" },
        ),
        { status: 200 },
      ),
  );
});
test("registration creates a new auto-confirmed fictional account and returns no secrets or user record", async () => {
  const response = await handler(
    request({
      email: "TEST@example.com",
      password: "Practice-only-492!",
      app_metadata: { role: "admin" },
    }),
  );
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ created: true });
  const adminRequest = fetcher.mock.calls[2];
  expect(adminRequest[0]).toBe("https://test.supabase.co/auth/v1/admin/users");
  expect(JSON.parse(adminRequest[1]!.body as string)).toEqual({
    email: "test@example.com",
    password: "Practice-only-492!",
    email_confirm: true,
  });
  expect(fetcher.mock.calls.every(([, init]) => init?.method === "POST")).toBe(
    true,
  );
});
test("registration rejects non-fictional domains, malformed bodies and short passwords before admin access", async () => {
  for (const body of [
    null,
    [],
    { email: "person@real-mail.com", password: "Practice-only-492!" },
    { email: "test@example.com", password: "short" },
    { email: "test@example.com.evil.org", password: "Practice-only-492!" },
  ]) {
    expect((await handler(request(body))).status).toBe(400);
  }
  expect(fetcher).not.toHaveBeenCalled();
});
test("registration rejects unrecognized API keys and cross-origin requests", async () => {
  expect(
    (await handler(request(undefined, { apikey: "unknown" }))).status,
  ).toBe(401);
  expect(
    (await handler(request(undefined, { origin: "https://evil.example" })))
      .status,
  ).toBe(403);
  expect(fetcher).not.toHaveBeenCalled();
});
test("registration denies attempts when persistent rate limit is exhausted or unavailable", async () => {
  fetcher.mockResolvedValueOnce(new Response("false"));
  expect((await handler(request())).status).toBe(429);
  expect(fetcher).toHaveBeenCalledTimes(1);
  fetcher.mockReset();
  fetcher.mockResolvedValueOnce(new Response("failure", { status: 500 }));
  expect((await handler(request())).status).toBe(503);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
test("duplicate account errors do not update an existing account or reveal backend internals", async () => {
  fetcher.mockImplementation(
    async (url) =>
      new Response(
        JSON.stringify(
          String(url).includes("/rpc/")
            ? true
            : { error: "private auth detail" },
        ),
        { status: String(url).includes("/rpc/") ? 200 : 422 },
      ),
  );
  const response = await handler(request());
  expect(response.status).toBe(400);
  expect(await response.text()).not.toContain("private auth detail");
  expect(fetcher).toHaveBeenCalledTimes(3);
});
test("CORS preflight accepts the app without account creation", async () => {
  const response = await handler(
    new Request("https://test.supabase.co/functions/v1/register-fictional", {
      method: "OPTIONS",
      headers: { origin: "https://proyecto-2-rho.vercel.app" },
    }),
  );
  expect(response.status).toBe(204);
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
    "https://proyecto-2-rho.vercel.app",
  );
  expect(fetcher).not.toHaveBeenCalled();
});
