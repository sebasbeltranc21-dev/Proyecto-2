"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Archive,
  Fingerprint,
  FolderOpen,
  Trophy,
  BarChart3,
  Home,
  Medal,
  Pause,
  Play,
} from "lucide-react";
import type { HomeSnapshot } from "@/lib/types";
import { characterFor } from "@/lib/characters";
import { ranks } from "@/lib/progression";
import { OfficeProgress } from "./office-records";
export function OfficeHub({
  data,
}: {
  data: HomeSnapshot;
}) {
  const character = characterFor(data.profile?.avatar ?? "lupa");
  const [characterPaused, setCharacterPaused] = useState(false);
  const p = data.progression;
  const rank = p ? ranks[Math.max(0, Math.min(4, p.rank_index))] : null;
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
        <Link href="/panel/expedientes">
          <Archive size={18} />
          Mis expedientes
        </Link>
        <a href="#abrir-expediente">
          <FolderOpen size={18} />
          Elegir caso
        </a>
        <Link href="/panel/estadisticas">
          <BarChart3 size={18} />
          Mis estadísticas
        </Link>
        <Link href="/panel/logros">
          <Trophy size={18} />
          Mis logros
        </Link>
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
      <OfficeProgress data={data} compact />
    </section>
  );
}
