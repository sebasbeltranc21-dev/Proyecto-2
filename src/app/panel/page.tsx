import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/config";
import { ConfigNotice } from "@/components/ui";
import { Dashboard } from "@/components/dashboard";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!isConfigured())
    return (
      <main id="contenido" className="shell dashboard">
        <p className="eyebrow">MI EXPEDIENTE</p>
        <h1>Prepara tu próxima investigación.</h1>
        <ConfigNotice />
      </main>
    );
  const client = await serverClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/acceso");
  const { data, error } = await client.rpc("mm_home");
  return (
    <main id="contenido" className="shell dashboard">
      <Dashboard
        anonymous={Boolean(user.is_anonymous)}
        initialData={data}
        initialError={
          error
            ? "No se pudo cargar tu expediente. Comprueba la conexión y las migraciones de Supabase."
            : ""
        }
      />
    </main>
  );
}
