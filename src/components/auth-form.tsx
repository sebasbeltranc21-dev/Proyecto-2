"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { isConfigured } from "@/lib/config";
import { ErrorNotice } from "./ui";
export function AuthForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const client = browserClient();
      const email = String(form.get("email")).trim();
      const password = String(form.get("password"));
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session) throw error ?? new Error("Sin sesión");
      router.replace("/panel");
      router.refresh();
    } catch {
      setError(
        "No se pudo acceder. Revisa las credenciales de práctica y la conexión. La cuenta ficticia debe estar creada y confirmada por el responsable en Supabase.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel auth-card">
      <div className="icon-badge">
        <LockKeyhole />
      </div>
      <p className="eyebrow">ACCESO ACADÉMICO / DATOS FICTICIOS</p>
      <h1>Abre tu expediente.</h1>
      <p className="notice" id="practice-account-help">
        Usa el correo inventado y la contraseña de práctica que te facilite el
        responsable. No introduzcas tu correo personal ni reutilices una
        contraseña personal.
      </p>
      {error && <ErrorNotice message={error} />}
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
            autoComplete="current-password"
            required
            maxLength={128}
            placeholder="Contraseña de práctica"
          />
        </label>
        <button
          className="button primary full"
          disabled={busy || !isConfigured()}
        >
          {busy ? "Conectando…" : "Entrar al expediente"}
          <ArrowRight size={18} />
        </button>
      </form>
      <details className="guest">
        <summary>¿Cómo consigo una cuenta de práctica?</summary>
        <p>
          El responsable crea cada cuenta en Supabase y la confirma
          automáticamente. No necesitas recibir correos. Por ejemplo:
          ana@example.com y luis@example.com; son ejemplos y deben crearse antes
          de usarlos.
        </p>
        <p>
          Cada jugador usa su propia cuenta. En otro navegador, entra con las
          mismas credenciales para recuperar tu expediente guardado en Supabase.
        </p>
      </details>
    </section>
  );
}
