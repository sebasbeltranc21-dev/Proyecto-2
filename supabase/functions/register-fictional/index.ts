type RegistrationConfig = {
  url: string;
  adminKey: string;
  publishableKeys: string[];
  fetcher?: typeof fetch;
};

// Public account creation endpoint. The only privileged operation is creating a
// NEW, confirmed account at the reserved example.com domain; no updates or deletes.
export function registrationHandler(config: RegistrationConfig) {
  const fetcher = config.fetcher ?? fetch;
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "https://proyecto-2-rho.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    };
    if (origin && allowedOrigins.includes(origin))
      headers["Access-Control-Allow-Origin"] = origin;
    const reply = (status: number, value: object) =>
      new Response(JSON.stringify(value), { status, headers });
    if (origin && !allowedOrigins.includes(origin))
      return reply(403, { error: "Origen no permitido." });
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      return reply(405, { error: "Método no permitido." });
    // Publishable API key verification replaces the JWT check: new users do not
    // yet have a session. The admin key is never accepted from a caller.
    if (!config.publishableKeys.includes(request.headers.get("apikey") ?? ""))
      return reply(401, { error: "Acceso no válido." });
    if (!config.url || !config.adminKey)
      return reply(503, {
        error: "El registro no está disponible. Inténtalo más tarde.",
      });
    try {
      const raw = await request.text();
      if (raw.length > 2048)
        return reply(413, { error: "Solicitud demasiado grande." });
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(raw);
      } catch {
        return reply(400, { error: "Solicitud inválida." });
      }
      if (!body || typeof body !== "object" || Array.isArray(body))
        return reply(400, { error: "Solicitud inválida." });
      const email =
        typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!/^[a-z0-9][a-z0-9._-]{1,47}@example\.com$/.test(email))
        return reply(400, {
          error:
            "Usa un correo inventado terminado en @example.com, como detective123@example.com.",
        });
      if (password.length < 8 || password.length > 128)
        return reply(400, {
          error: "La contraseña debe tener entre 8 y 128 caracteres.",
        });
      const adminHeaders = {
        apikey: config.adminKey,
        "Content-Type": "application/json",
        ...(config.adminKey.startsWith("eyJ")
          ? { Authorization: `Bearer ${config.adminKey}` }
          : {}),
      };
      const hash = Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(email),
          ),
        ),
      )
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      for (const [bucket, limit] of [
        ["global", 100],
        [`email:${hash}`, 3],
      ] as const) {
        const slot = await fetcher(
          `${config.url}/rest/v1/rpc/mm_claim_registration`,
          {
            method: "POST",
            headers: adminHeaders,
            body: JSON.stringify({ p_bucket: bucket, p_limit: limit }),
          },
        );
        if (!slot.ok)
          return reply(503, {
            error: "El registro no está disponible. Inténtalo más tarde.",
          });
        if ((await slot.json()) !== true)
          return reply(429, {
            error:
              "Se alcanzó el límite de intentos. Espera una hora antes de volver a crear una cuenta.",
          });
      }
      const result = await fetcher(`${config.url}/auth/v1/admin/users`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ email, password, email_confirm: true }),
      });
      if (!result.ok)
        return reply(result.status >= 500 ? 503 : 400, {
          error:
            "No se pudo crear la cuenta. Prueba otro correo inventado o inicia sesión si ya la creaste. Usa una contraseña de práctica más larga si el problema continúa.",
        });
      return reply(201, { created: true });
    } catch {
      return reply(503, {
        error:
          "No se pudo conectar. Comprueba tu conexión y vuelve a intentarlo.",
      });
    }
  };
}

type EdgeRuntime = {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};
const runtime = (globalThis as typeof globalThis & { Deno?: EdgeRuntime }).Deno;
if (runtime) {
  const keys = (name: string): string[] => {
    try {
      return Object.values(JSON.parse(runtime.env.get(name) || "{}")).filter(
        (value): value is string =>
          typeof value === "string" && value.length > 0,
      );
    } catch {
      return [];
    }
  };
  runtime.serve(
    registrationHandler({
      url: runtime.env.get("SUPABASE_URL") ?? "",
      adminKey:
        runtime.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
        keys("SUPABASE_SECRET_KEYS")[0] ||
        "",
      publishableKeys: [
        ...keys("SUPABASE_PUBLISHABLE_KEYS"),
        runtime.env.get("SUPABASE_ANON_KEY") || "",
      ].filter(Boolean),
    }),
  );
}
