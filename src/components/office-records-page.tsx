import Link from "next/link";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/config";
import { ConfigNotice, ErrorNotice } from "./ui";
import { OfficeAchievements, OfficeArchive, OfficeStatistics } from "./office-records";
import type { HomeSnapshot } from "@/lib/types";

export type OfficeView = "logros" | "expedientes" | "estadisticas";
const sections = {logros:"Mis logros",expedientes:"Mis expedientes",estadisticas:"Mis estadísticas"};
export async function OfficeRecordsPage({view}:{view:OfficeView}) {
 if (!isConfigured()) return <main id="contenido" className="shell dashboard"><h1>{sections[view]}</h1><ConfigNotice/></main>;
 const client = await serverClient();
 const { data:{user} } = await client.auth.getUser();
 if(!user) redirect("/acceso");
 const {data,error} = await client.rpc("mm_home");
 return <main id="contenido" className="shell dashboard office-records-page">
 <header className="page-heading"><div><p className="eyebrow">ARCHIVO PERSONAL / MODO MISTERIO</p><h1>{sections[view]}</h1></div><Link className="button secondary" href="/panel">Volver a mi oficina</Link></header>
 <nav className="office-records-nav" aria-label="Archivo personal">{(Object.keys(sections) as OfficeView[]).map(key=><Link href={`/panel/${key}`} key={key} aria-current={view===key?"page":undefined}>{sections[key]}</Link>)}</nav>
 {error || !data ? <ErrorNotice message="No se pudo consultar tu archivo. Recarga la página para intentarlo de nuevo."/> : view==="logros" ? <OfficeAchievements data={data as HomeSnapshot}/> : view==="expedientes" ? <OfficeArchive data={data as HomeSnapshot}/> : <OfficeStatistics data={data as HomeSnapshot}/>}
 </main>;
}
