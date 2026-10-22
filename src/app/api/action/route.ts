import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/config";
import { actionSchema } from "@/lib/validation";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Origen no permitido." },
      { status: 403 },
    );
  if (!isConfigured())
    return NextResponse.json(
      { error: "Supabase todavía no está configurado." },
      { status: 503 },
    );
  const body = await request.text();
  if (body.length > 4096)
    return NextResponse.json(
      { error: "Solicitud demasiado grande." },
      { status: 413 },
    );
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(value);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  const client = await serverClient();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user)
    return NextResponse.json(
      { error: "Inicia sesión para continuar." },
      { status: 401 },
    );
  const { data, error } = await client.rpc("mm_action", {
    payload: parsed.data,
  });
  if (error || data?.error) {
    const message = error?.message || String(data.error);
    const known = message.startsWith("MM:");
    return NextResponse.json(
      {
        error: known
          ? message.slice(3)
          : "No se pudo completar la acción. Revisa la conexión y las migraciones de Supabase.",
      },
      { status: known ? 400 : 503 },
    );
  }
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
