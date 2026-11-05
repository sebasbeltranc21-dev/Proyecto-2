import Image from "next/image";
import Link from "next/link";
import { Medal, FolderOpen, CheckCheck, Trophy, Search, Sparkles, LockKeyhole, ArrowRight, FileSearch, Crosshair } from "lucide-react";
import type { HomeSnapshot } from "@/lib/types";
import { characterFor } from "@/lib/characters";
import { ranks, achievements } from "@/lib/progression";
import { Avatar } from "./ui";
import { casePresentation } from "@/lib/case-presentation";
import { orderedCases } from "@/lib/case-order";

export function OfficeProgress({data,compact=false}:{data:HomeSnapshot;compact?:boolean}) {
const character = characterFor(data.profile?.avatar ?? "lupa");
  const p = data.progression;
  const rank = p ? ranks[Math.max(0, Math.min(4, p.rank_index))] : null;
  const next = p ? ranks[p.rank_index + 1] : null;
return (      <section
        className={`office-progression ${compact ? "office-progression-compact" : ""}`}
        id="mis-estadisticas"
        aria-label={compact ? "Tu trayectoria" : "Mis estadísticas"}
      >
        <div className="office-rank-card">
          <div className="office-rank-intro">
            <span className="office-rank-seal" aria-hidden="true">
              <Medal size={32} />
            </span>
            <div>
              <p className="eyebrow">TU TRAYECTORIA</p>
              <h3>{rank?.name ?? "Cargando progreso"}</h3>
            </div>
            <Image
              className="office-rank-sticker"
              src={character.image}
              alt=""
              width={110}
              height={128}
              sizes="110px"
            />
          </div>
          <p>
            {next
              ? `Siguiente rango: ${next.name}. Requiere ${next.games} casos completados y ${next.wins} victorias.`
              : p
                ? "Has alcanzado el rango más alto de la agencia."
                : "Las estadísticas aparecerán al consultar tu perfil."}
          </p>
          {p && next && (
            <progress
              value={Math.min(
                p.completed / next.games,
                next.wins ? p.wins / next.wins : 1,
                1,
              )}
              max={1}
              aria-label={`Progreso hacia ${next.name}`}
            />
          )}
          {!compact && <details>
            <summary>Condiciones de los rangos</summary>
            <ul>
              {ranks.map((r) => (
                <li key={r.name}>
                  {r.name}: {r.games} casos y {r.wins} victorias de equipo.
                </li>
              ))}
            </ul>
          </details>}
        </div>
        {!compact && <dl className="office-metrics">
          {[
            { label: "Partidas jugadas", value: p?.played, Icon: FolderOpen },
            {
              label: "Casos completados",
              value: p?.completed,
              Icon: CheckCheck,
            },
            { label: "Victorias de equipo", value: p?.wins, Icon: Trophy },
            {
              label: "Pistas compartidas",
              value: p?.shared_clues,
              Icon: Search,
            },
          ].map(({ label, value, Icon }) => (
            <div key={label}>
              <dt>
                <Icon size={20} aria-hidden="true" />
                {label}
              </dt>
              <dd>{value ?? "—"}</dd>
            </div>
          ))}
        </dl>}
      </section>
);
}
export function OfficeAchievements({data}:{data:HomeSnapshot}) {
 const p = data.progression;
 return (      <section
        id="mis-logros"
        className="office-achievements"
        aria-label="Mis logros"
      >
        <div className="office-section-heading">
          <p className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            VITRINA DE LA AGENCIA
          </p>
          <h3>Distinciones de tu investigación</h3>
          <p>
            Se desbloquean con partidas reales. Las fechas corresponden al
            cierre del caso que cumplió la condición.
          </p>
        </div>
        <div className="office-achievement-grid">
          {achievements.map((a) => {
            const date = p?.achievements[a.id];
            return (
              <article
                key={a.id}
                className={`office-achievement ${date ? "earned" : "locked"}`}
              >
                {date ? <Trophy size={27} /> : <LockKeyhole size={25} />}
                <h4>{a.name}</h4>
                <p>{a.description}</p>
                <small>{a.condition}</small>
                {date ? (
                  <time dateTime={date}>
                    Desbloqueado:{" "}
                    {new Intl.DateTimeFormat("es-EC", {
                      dateStyle: "medium",
                      timeZone: "America/Guayaquil",
                    }).format(new Date(date))}
                  </time>
                ) : (
                  <span>{p ? "Bloqueado" : "Consultando…"}</span>
                )}
              </article>
            );
          })}
        </div>
      </section>
);
}
export function OfficeArchive({data}:{data:HomeSnapshot}) {
return (<>
<section className="office-case-section">
<div className="office-section-heading"><p className="eyebrow">ARCHIVO DE CASOS</p><h2>Los expedientes de la agencia</h2><p>Abre un caso para preparar una nueva investigación.</p></div>
<div className="office-case-grid">
{orderedCases(data.cases).map(c=><Link key={c.slug} className={`office-case office-case-${c.theme}`} href={`/panel?caso=${encodeURIComponent(c.slug)}#abrir-expediente`}>
<Image src={casePresentation[c.theme].image} alt="" width={640} height={360} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"/>
<span className="office-case-number">EXPEDIENTE {casePresentation[c.theme].number}</span><b>{c.title}</b><small>Abrir expediente <ArrowRight size={16}/></small>
</Link>)}
</div></section>
            <section className="panel archive-panel" id="mis-expedientes">
              <h2>
                <FolderOpen size={20} />
                Tus expedientes
              </h2>
              {data.rooms.length === 0 ? (
                <p className="empty">
                  Todavía no tienes salas. Abre tu primer expediente.
                </p>
              ) : (
                <ul className="data-list">
                  {data.rooms.map((r) => (
                    <li key={r.code}>
                      <Link href={`/sala/${r.code}`}>
                        <b className="mono">{r.code}</b>
                        {r.title && (
                          <small className="recent-case-title">{r.title}</small>
                        )}
                        <span
                          className={`archive-status ${r.status === "active" ? "active" : r.status === "finished" ? "finished" : "waiting"}`}
                        >
                          {r.status === "lobby"
                            ? "En espera"
                            : r.status === "active"
                              ? "En curso"
                              : "Finalizada"}
                        </span>
                        <ArrowRight size={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="subheading">Historial de resultados</h3>
              {data.history.length === 0 ? (
                <p className="empty">
                  Tus resultados aparecerán al completar una partida.
                </p>
              ) : (
                <ul className="data-list">
                  {data.history.map((h) => (
                    <li key={h.code}>
                      <Link href={`/sala/${h.code}`}>
                        <span>
                          {h.title}
                          <small className="muted">
                            {new Date(h.finished_at).toLocaleDateString(
                              "es-EC",
                            )}
                          </small>
                        </span>
                        <b className="gold">{h.points} pts</b>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

</>);
}
export function OfficeStatistics({data}:{data:HomeSnapshot}) {
return (<>
<OfficeProgress data={data}/>
          <div className="stats-strip">
            <div>
              <FileSearch size={21} aria-hidden="true" />
              <b>{data.stats.games}</b>
              <span>Casos completados</span>
            </div>
            <div>
              <Crosshair size={21} aria-hidden="true" />
              <b>{data.stats.correct}</b>
              <span>Acusaciones correctas</span>
            </div>
            <div>
              <Trophy size={21} aria-hidden="true" />
              <b>{data.stats.points}</b>
              <span>Puntos acumulados</span>
            </div>
          </div>

            <section className="panel leaderboard-panel">
              <h2>
                <Trophy size={20} />
                Clasificación
              </h2>
              <p className="muted">Investigadores con más puntos · Top 10</p>
              {data.leaderboard.length === 0 ? (
                <p className="empty">
                  El primer caso resuelto abrirá la clasificación.
                </p>
              ) : (
                <ol className="data-list rankings">
                  {data.leaderboard.map((p, i) => (
                    <li key={i}>
                      <span className="muted mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Avatar small kind={p.avatar} />
                      <span>
                        {p.name}
                        <small className="muted">{p.games} partidas</small>
                      </span>
                      <b className="gold">{p.points}</b>
                    </li>
                  ))}
                </ol>
              )}
            </section>

</>);
}
