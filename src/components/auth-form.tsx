"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { isConfigured } from "@/lib/config";
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
      const email = String(form.get("email")).trim();
      const password = String(form.get("password"));
      if (mode === "signup") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice(
            "Revisa tu correo para confirmar la cuenta. Si ya estás registrado, entra con tu contraseña.",
          );
          return;
        }
      } else {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.replace("/panel");
      router.refresh();
    } catch {
      setError(
        "No se pudo acceder. Revisa el correo y la contraseña, confirma tu cuenta y comprueba la conexión.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function guest() {
    setBusy(true);
    setError("");
    try {
      const { error } = await browserClient().auth.signInAnonymously();
      if (error) throw error;
      router.replace("/panel");
      router.refresh();
    } catch {
      setError(
        "No se pudo iniciar como invitado. Comprueba que los accesos anónimos estén activados en Supabase.",
      );
      setBusy(false);
    }
  }
  return (
    <section className="panel auth-card">
      <div className="icon-badge">
        <LockKeyhole />
      </div>
      <p className="eyebrow">TU EXPEDIENTE PERSONAL</p>
      <h1>
        {mode === "login"
          ? "Bienvenido de nuevo."
          : "Únete a la investigación."}
      </h1>
      <p className="muted">Tu equipo te espera al otro lado de la puerta.</p>
      <div className="segmented">
        <button
          aria-pressed={mode === "login"}
          onClick={() => setMode("login")}
        >
          Iniciar sesión
        </button>
        <button
          aria-pressed={mode === "signup"}
          onClick={() => setMode("signup")}
        >
          Crear cuenta
        </button>
      </div>
      {error && <ErrorNotice message={error} />}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <form onSubmit={submit}>
        <label>
          Correo electrónico
          <input
            name="email"
            autoComplete="email"
            type="email"
            required
            maxLength={254}
            placeholder="tu@correo.com"
          />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={8}
            maxLength={128}
            placeholder="Al menos 8 caracteres"
          />
        </label>
        <button
          className="button primary full"
          disabled={busy || !isConfigured()}
        >
          {busy
            ? "Conectando…"
            : mode === "login"
              ? "Entrar al expediente"
              : "Crear mi cuenta"}
          <ArrowRight size={18} />
        </button>
      </form>
      {process.env.NEXT_PUBLIC_ALLOW_GUESTS === "true" && (
        <div className="guest">
          <button
            className="text-link"
            disabled={busy || !isConfigured()}
            onClick={guest}
          >
            Continuar como invitado <ArrowRight size={16} />
          </button>
          <p>
            Tu acceso se conserva en este navegador. Al cerrar sesión o borrar
            sus datos, no podrás recuperarlo.
          </p>
        </div>
      )}
    </section>
  );
}
