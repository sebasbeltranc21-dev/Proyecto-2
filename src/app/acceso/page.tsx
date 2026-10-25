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
          El enlace de acceso no es válido. Entra con tu cuenta de práctica;
          puedes crear una cuenta ficticia directamente en esta página.
        </p>
      )}
      <AuthForm />
    </main>
  );
}
