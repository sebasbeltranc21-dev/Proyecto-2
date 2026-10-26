"use client";
import Image from "next/image";
import { useState } from "react";
import { Grip, Pause, Play, Search, X } from "lucide-react";
import { useFloatingPosition } from "@/hooks/use-floating-position";
import { characterFor } from "@/lib/characters";

export function InvestigatorCompanion({ kind }: { kind: string }) {
  const character = characterFor(kind);
  const [minimized, setMinimized] = useState(false);
  const [paused, setPaused] = useState(false);
  const { ref: widgetRef, style, dragProps, reset } = useFloatingPosition();
  return (
    <aside
      ref={widgetRef}
      style={style}
      className={`investigator-companion companion-left ${minimized ? "companion-minimized" : ""}`}
      data-paused={paused}
      aria-label={`Tu personaje: ${character.name}`}
    >
      {minimized ? (
        <button
          className="companion-restore"
          onClick={() => setMinimized(false)}
          aria-label="Mostrar mi personaje"
        >
          <Search size={16} />
        </button>
      ) : (
        <>
          <button
            className="companion-drag widget-drag-handle"
            {...dragProps}
            aria-label="Mover mi personaje"
            title="Arrastra para mover; flechas del teclado para ajustar; Inicio para restablecer"
          >
            <div className="companion-stage" aria-hidden="true">
              <span className="companion-scan" />
              <div className="companion-character">
                <Image
                  src={character.image}
                  alt=""
                  width={160}
                  height={210}
                  draggable={false}
                />
                <Search className="companion-lens" size={27} />
              </div>
              <span className="companion-floor" />
            </div>
          </button>
          <div className="companion-controls">
            <button
              onClick={() => setPaused(!paused)}
              aria-label={paused ? "Animar personaje" : "Pausar personaje"}
              aria-pressed={paused}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button
              onClick={reset}
              aria-label="Restablecer posición del personaje"
            >
              <Grip size={14} />
            </button>
            <button
              onClick={() => setMinimized(true)}
              aria-label="Minimizar personaje"
            >
              <X size={14} />
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
