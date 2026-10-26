import { Fingerprint, Search, FileSearch, Clock3 } from "lucide-react";

// Illustrations of the investigative method, never clues or a case solution.
export function AgencySeal({ small = false }: { small?: boolean }) {
  return (
    <span className={`agency-seal${small ? " small" : ""}`} aria-hidden="true">
      <span className="seal-orbit" />
      <Fingerprint size={small ? 26 : 52} strokeWidth={1.2} />
      <span className="seal-star">✦</span>
    </span>
  );
}

export function InvestigationBoard() {
  return (
    <div className="investigation-board" aria-hidden="true">
      <span className="board-corner top-left" />
      <span className="board-corner bottom-right" />
      <span className="board-caption">
        MESA DE ANÁLISIS / CONECTA LOS HECHOS
      </span>
      <svg
        className="board-threads"
        viewBox="0 0 560 340"
        fill="none"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d="M115 79L430 101L278 265L115 79L430 101"
          stroke="#983e3d"
          strokeWidth="2"
        />
        <path d="M115 79L278 265" stroke="#d37b64" strokeWidth=".6" />
      </svg>
      <div className="board-photo">
        <span className="board-pin" />
        <div className="board-photo-scene">
          <span className="scene-beam" />
          <Search size={45} strokeWidth={1} />
          <span className="photo-crosshair" />
        </div>
        <span>01. LA ESCENA</span>
      </div>
      <div className="board-testimony">
        <span className="board-pin" />
        <span className="note-type">DECLARACIÓN</span>
        <Clock3 size={22} strokeWidth={1.2} />
        <span className="note-handwriting">
          ¿Coinciden
          <br />
          las horas?
        </span>
        <span className="note-rule" />
        <span className="note-rule short" />
      </div>
      <div className="board-evidence">
        <span className="board-pin" />
        <Fingerprint size={39} strokeWidth={1.1} />
        <span>
          EXAMINAR
          <br />
          <b>Y CONTRASTAR</b>
        </span>
      </div>
      <div className="board-tag">
        <FileSearch size={14} /> NINGUNA PISTA AISLADA
      </div>
    </div>
  );
}
