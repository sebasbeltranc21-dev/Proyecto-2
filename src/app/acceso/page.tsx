import { AuthForm } from "@/components/auth-form";
import { ConfigNotice } from "@/components/ui";
import { AgencySeal } from "@/components/investigation-decor";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main id="contenido" className="shell access-page">
      <ConfigNotice />
      <aside className="access-intro">
        <div className="access-case-cover">
          <span className="cover-tab">MODO MISTERIO / IDENTIFICACIÓN</span>
          <AgencySeal />
          <p className="eyebrow">CREDENCIAL DEL INVESTIGADOR</p>
          <h2>
            Cada caso deja huella.
            <br />
            <em>La tuya empieza aquí.</em>
          </h2>
          <p>
            Tu alias, tus expedientes y tus hallazgos. Un lugar al que volver
            después de cada investigación.
          </p>
          <span className="cover-signature" aria-hidden="true">
            OBSERVAR · CONTRASTAR · DEDUCIR
          </span>
        </div>
        <p className="access-footnote">
          Conserva tus credenciales de práctica para recuperar tu historial
          desde otro dispositivo.
        </p>
      </aside>
      <div className="access-form-column">
        {error && (
          <p role="alert" className="notice error">
            El enlace de acceso no es válido. Entra con tu cuenta de práctica;
            puedes crear una cuenta ficticia directamente en esta página.
          </p>
        )}
        <AuthForm />
      </div>
    </main>
  );
}
