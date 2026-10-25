"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { isConfigured, supabaseConfig } from "@/lib/config";
import { ErrorNotice } from "./ui";
export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(e.currentTarget);
    try {
      const client = browserClient();
      const email = String(form.get("email")).trim().toLowerCase();
      const password = String(form.get("password"));
      if (mode === "signup") {
        if (!/^[a-z0-9][a-z0-9._-]{1,47}@example\.com$/.test(email))
          throw new Error(
            "Usa un correo inventado terminado en @example.com, como detective123@example.com.",
          );
        if (password.length < 8 || password.length > 128)
          throw new Error("La contraseña debe tener entre 8 y 128 caracteres.");
        if (password !== String(form.get("confirmation")))
          throw new Error("Las contraseñas no coinciden.");
        const { url, key } = supabaseConfig();
        const response = await fetch(`${url}/functions/v1/register-fictional`, {
          method: "POST",
          headers: { apikey: key, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (!response.ok || result.created !== true)
          throw new Error(
            result.error || "No se pudo crear la cuenta. Inténtalo de nuevo.",
          );
        // A successful registration is retained even if the following login fails.
        setMode("login");
        setNotice(
          "Cuenta ficticia creada. Conserva tu correo y contraseña para recuperar tus datos de juego.",
        );
      }
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session)
        throw new Error(
          "No se pudo entrar. Revisa tu correo y contraseña de práctica y la conexión. Si acabas de crear la cuenta, pulsa Entrar al expediente para reintentar.",
        );
      router.replace("/panel");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo acceder. Comprueba tu conexión y vuelve a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  }
  function choose(next: "login" | "signup") {
    setMode(next);
    setError("");
    setNotice("");
  }
  return (
    <section className="panel auth-card">
      <div className="icon-badge">
        <LockKeyhole />
      </div>
      <p className="eyebrow">ACCESO ACADÉMICO / DATOS FICTICIOS</p>
      <h1>Abre tu expediente.</h1>
      <p className="notice" id="practice-account-help">
        Crea tu cuenta con un correo inventado terminado en @example.com y una
        contraseña de práctica. No necesitas recibir correos. No uses datos ni
        contraseñas personales.
      </p>
      <div className="segmented" aria-label="Opciones de acceso">
        <button
          disabled={busy}
          aria-pressed={mode === "login"}
          onClick={() => choose("login")}
        >
          Iniciar sesión
        </button>
        <button
          disabled={busy}
          aria-pressed={mode === "signup"}
          onClick={() => choose("signup")}
        >
          Crear cuenta ficticia
        </button>
      </div>
      {error && <ErrorNotice message={error} />}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <form onSubmit={submit} aria-describedby="practice-account-help">
        <label>
          Correo electrónico de práctica
          <input
            name="email"
            autoComplete="username"
            type="email"
            required
            maxLength={254}
            placeholder="ana@example.com"
          />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            minLength={mode === "signup" ? 8 : undefined}
            maxLength={128}
            placeholder="Contraseña de práctica"
          />
        </label>
        {mode === "signup" && (
          <label>
            Repite la contraseña
            <input
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              placeholder="Repite tu contraseña de práctica"
            />
          </label>
        )}
        <button
          className="button primary full"
          disabled={busy || !isConfigured()}
        >
          {busy
            ? "Conectando…"
            : mode === "signup"
              ? "Crear mi cuenta y entrar"
              : "Entrar al expediente"}
          <ArrowRight size={18} />
        </button>
      </form>
      <details className="guest">
        <summary>¿Cómo recupero mis datos de juego?</summary>
        <p>
          Guarda el correo inventado y la contraseña que elegiste. Usa Iniciar
          sesión con esos mismos datos en otro navegador o dispositivo: tu
          perfil, historial y puntuación se guardan en Supabase.
        </p>
        <p>
          Cada jugador crea su propia cuenta. Como el correo es inventado, no se
          pueden recuperar contraseñas mediante un mensaje de correo.
        </p>
      </details>
    </section>
  );
}
