import { AuthForm } from "@/components/auth-form";
import { ConfigNotice } from "@/components/ui";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main id="contenido" className="shell narrow">
      <ConfigNotice />
      {error && (
        <p role="alert" className="notice error">
          No se pudo confirmar el correo. Solicita un enlace nuevo registrándote
          otra vez.
        </p>
      )}
      <AuthForm />
    </main>
  );
}
