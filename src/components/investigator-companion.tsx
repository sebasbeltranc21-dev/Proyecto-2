"use client";
import Image from "next/image";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { characterFor } from "@/lib/characters";

/** Anchored in the case header, outside the evidence and chat workspaces. */
export function InvestigatorCompanion({ kind }: { kind: string }) {
  const character = characterFor(kind);
  const [paused, setPaused] = useState(false);
  return (
    <aside
      className="room-investigator"
      data-paused={paused}
      aria-label={`Tu personaje: ${character.name}`}
    >
      <Image
        className="room-investigator-image"
        src={character.image}
        alt=""
        width={120}
        height={156}
        sizes="(max-width: 760px) 70px, 110px"
        draggable={false}
      />
      <button
        type="button"
        className="widget-icon-button"
        onClick={() => setPaused(!paused)}
        aria-label={
          paused
            ? "Animar personaje de cabecera"
            : "Pausar personaje de cabecera"
        }
        aria-pressed={paused}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </aside>
  );
}
