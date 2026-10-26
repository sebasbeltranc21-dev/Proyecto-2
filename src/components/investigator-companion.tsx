"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeftRight, Pause, Play, Search, X } from "lucide-react";
import { characterFor } from "@/lib/characters";

export function InvestigatorCompanion({
  kind,
  stage,
}: {
  kind: string;
  stage: number;
}) {
  const character = characterFor(kind);
  const [minimized, setMinimized] = useState(false);
  const [paused, setPaused] = useState(false);
  const [side, setSide] = useState<"left" | "right">("left");
  const activity =
    stage === 0
      ? "Observando la escena"
      : stage === 1
        ? "Contrastando las pistas"
        : "Pensando en el veredicto";
  if (minimized)
    return (
      <button
        className={`companion-restore companion-${side}`}
        onClick={() => setMinimized(false)}
        aria-label="Mostrar mi personaje"
      >
        <Search size={16} /> Mi personaje
      </button>
    );
  return (
    <aside
      className={`investigator-companion companion-${side}`}
      data-paused={paused}
      aria-label={`Tu personaje: ${character.name}`}
    >
      <div className="companion-caption">
        <b>{character.name}</b>
        <span>{activity}</span>
      </div>
      <div className="companion-stage" aria-hidden="true">
        <span className="companion-scan" />
        <div className="companion-character">
          <Image src={character.image} alt="" width={160} height={210} />
          <Search className="companion-lens" size={27} />
        </div>
        <span className="companion-floor" />
      </div>
      <div className="companion-controls">
        <button
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Animar personaje" : "Pausar personaje"}
          aria-pressed={paused}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          onClick={() => setSide(side === "left" ? "right" : "left")}
          aria-label="Cambiar personaje de lado"
        >
          <ArrowLeftRight size={14} />
        </button>
        <button
          onClick={() => setMinimized(true)}
          aria-label="Minimizar personaje"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
