"use client";
import Image from "next/image";
import { useState } from "react";
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
  Pause,
  Play,
  Sparkles,
  Search,
  CheckCheck,
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
  const [characterPaused, setCharacterPaused] = useState(false);
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
        <div
          className="office-seated-detective"
          data-paused={characterPaused}
          aria-label={`${character.name}, sentado en su escritorio`}
        >
          <div className="office-seated-motion">
            <Image
              src={character.seatedImage}
              alt={`${character.name} sentado investigando`}
              width={400}
              height={460}
              sizes="(max-width: 600px) 35vw, 400px"
              priority
            />
          </div>
        </div>
        <div className="office-desk-foreground" aria-hidden="true">
          <Image
            src="/office/dispatch.webp"
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 1200px"
          />
        </div>
      </div>
      <nav className="office-actionbar" aria-label="Acciones de la oficina">
        <a href="#unirse">
          <Phone size={18} />
          Teléfono de la central
        </a>
        <a href="#mis-expedientes">
          <Archive size={18} />
          Mis expedientes
        </a>
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
        <button
          type="button"
          aria-pressed={characterPaused}
          onClick={() => setCharacterPaused(!characterPaused)}
        >
          {characterPaused ? <Play size={18} /> : <Pause size={18} />}{" "}
          {characterPaused ? "Animar personaje" : "Pausar personaje"}
        </button>
      </nav>
      <section
        className="office-progression"
        id="mis-estadisticas"
        aria-label="Mis estadísticas"
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
    </section>
  );
}
