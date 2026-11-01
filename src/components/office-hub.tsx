"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Archive,
  Fingerprint,
  ArrowUpRight,
  FolderOpen,
  Trophy,
  LockKeyhole,
  BarChart3,
  Home,
  Medal,
} from "lucide-react";
import type { HomeSnapshot } from "@/lib/types";
import { characterFor } from "@/lib/characters";
import { casePresentation } from "@/lib/case-presentation";
import { ranks, achievements } from "@/lib/progression";
export function OfficeHub({
  data,
  selected,
  onSelect,
}: {
  data: HomeSnapshot;
  selected: string;
  onSelect: (slug: string) => void;
}) {
  const character = characterFor(data.profile?.avatar ?? "lupa");
  const p = data.progression;
  const rank = p ? ranks[Math.max(0, Math.min(4, p.rank_index))] : null;
  const next = p ? ranks[p.rank_index + 1] : null;
  return (
    <section
      className="detective-office"
      aria-label="Tu oficina de investigación"
    >
      <header className="office-titlebar">
        <div>
          <p className="eyebrow">AGENCIA MODO MISTERIO / DESPACHO PERSONAL</p>
          <h2>La Oficina del Detective</h2>
        </div>
        <span className="office-rank">
          <Medal size={20} />
          {rank?.name ?? "Consultando rango…"}
        </span>
      </header>
      <div className="office-stage">
        <Image
          className="office-backdrop"
          src="/office/dispatch.webp"
          alt="Despacho de investigación con escritorio, lámpara, tablero de pistas y archivadores"
          fill
          sizes="(max-width: 760px) 100vw, 1200px"
          priority
        />
        <div className="office-stage-shade" />
        <div className="office-welcome-note">
          <span>BIENVENIDO A TU DESPACHO</span>
          <p>{data.profile?.name ?? "Investigador"}</p>
          <small>Un nuevo expediente te espera.</small>
        </div>
        <div
          className="office-portrait"
          aria-label={`Credencial de ${data.profile?.name ?? "investigador"}`}
        >
          <div>
            <Image
              src={character.image}
              alt={character.name}
              width={100}
              height={125}
            />
          </div>
          <b>{data.profile?.name ?? "Tu identidad"}</b>
          <small>{rank?.name ?? "Perfil de investigador"}</small>
        </div>
        <a className="office-scene-link office-board-link" href="#mis-logros">
          <Trophy size={20} />
          <span>Mis logros</span>
          <ArrowUpRight size={13} />
        </a>
        <a
          className="office-scene-link office-files-link"
          href="#mis-expedientes"
        >
          <Archive size={20} />
          <span>Mis expedientes</span>
          <ArrowUpRight size={13} />
        </a>
        <a className="office-scene-link office-phone-link" href="#unirse">
          <Phone size={20} />
          <span>Teléfono de la central</span>
          <ArrowUpRight size={13} />
        </a>
        <div
          className="office-award-shelf"
          aria-label="Insignias de tu oficina"
        >
          {achievements.slice(0, 3).map((a) => {
            const date = p?.achievements[a.id];
            return (
              <a
                href="#mis-logros"
                className={date ? "earned" : "locked"}
                key={a.id}
                title={`${a.name}: ${date ? "desbloqueado" : "bloqueado"}`}
                aria-label={`${a.name}: ${date ? "desbloqueado" : "bloqueado"}`}
              >
                {date ? <Medal size={24} /> : <LockKeyhole size={20} />}
              </a>
            );
          })}
        </div>
      </div>
      <nav className="office-actionbar" aria-label="Acciones de la oficina">
        <a href="#oficina-casos">
          <FolderOpen size={18} />
          Elegir caso
        </a>
        <a href="#mis-estadisticas">
          <BarChart3 size={18} />
          Mis estadísticas
        </a>
        <a href="#mis-logros">
          <Trophy size={18} />
          Mis logros
        </a>
        <a href="#perfil-investigador">
          <Fingerprint size={18} />
          Mi credencial
        </a>
        <Link href="/">
          <Home size={18} />
          Volver al inicio
        </Link>
      </nav>
      <section
        className="office-progression"
        id="mis-estadisticas"
        aria-label="Mis estadísticas"
      >
        <div>
          <p className="eyebrow">TU TRAYECTORIA</p>
          <h3>{rank?.name ?? "Cargando progreso"}</h3>
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
          <details>
            <summary>Condiciones de los rangos</summary>
            <ul>
              {ranks.map((r) => (
                <li key={r.name}>
                  {r.name}: {r.games} casos y {r.wins} victorias de equipo.
                </li>
              ))}
            </ul>
          </details>
        </div>
        <dl className="office-metrics">
          {[
            ["Partidas jugadas", p?.played],
            ["Casos completados", p?.completed],
            ["Victorias de equipo", p?.wins],
            ["Pistas compartidas", p?.shared_clues],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="office-case-section" id="oficina-casos">
        <div className="office-section-heading">
          <p className="eyebrow">MESA DE ENTRADA</p>
          <h3>Elige tu próximo expediente</h3>
        </div>
        <div className="office-case-grid">
          {data.cases.map((c) => (
            <button
              type="button"
              key={c.slug}
              className={`office-case office-case-${c.theme}`}
              aria-pressed={selected === c.slug}
              onClick={() => {
                onSelect(c.slug);
                document
                  .getElementById("abrir-expediente")
                  ?.scrollIntoView({ block: "start" });
                document
                  .querySelector<HTMLInputElement>(
                    `input[name="caseSlug"][value="${c.slug}"]`,
                  )
                  ?.focus({ preventScroll: true });
              }}
            >
              <Image
                unoptimized
                src={casePresentation[c.theme].image}
                alt=""
                width={360}
                height={160}
              />
              <span className="office-case-number">
                EXPEDIENTE {casePresentation[c.theme].number}
              </span>
              <b>{c.title}</b>
              <small>
                {selected === c.slug
                  ? "Seleccionado · preparar sala"
                  : "Abrir expediente"}
                <ArrowUpRight size={14} />
              </small>
            </button>
          ))}
        </div>
      </section>
      <section
        id="mis-logros"
        className="office-achievements"
        aria-label="Mis logros"
      >
        <div className="office-section-heading">
          <p className="eyebrow">VITRINA DE LA AGENCIA</p>
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
    </section>
  );
}
