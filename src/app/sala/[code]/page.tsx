import { redirect, notFound } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/config";
import { roomCode } from "@/lib/validation";
import { ConfigNotice } from "@/components/ui";
import { GameRoom } from "@/components/game-room";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const parsed = roomCode.safeParse((await params).code);
  if (!parsed.success) notFound();
  if (!isConfigured())
    return (
      <main id="contenido" className="shell dashboard">
        <h1>Tu sala de investigación</h1>
        <ConfigNotice />
      </main>
    );
  const {
    data: { user },
  } = await (await serverClient()).auth.getUser();
  if (!user) redirect("/acceso");
  return (
    <main id="contenido" className="shell room-page">
      <GameRoom key={parsed.data} code={parsed.data} uid={user.id} />
    </main>
  );
}
