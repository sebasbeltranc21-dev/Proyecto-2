import React from "react";
import { createRoot } from "react-dom/client";
import { CaseEnding } from "../../../src/components/ending-cinematic";
import { SuspectPortrait } from "../../../src/components/case-art";
import { domeCharacters } from "../../../src/lib/dome-characters";
import type { RoomSnapshot } from "../../../src/lib/types";
import "../../../src/app/globals.css";
import "../../../src/app/investigation.css";
import "../../../src/app/office-room.css";
import "../../../src/app/chibi-ui.css";
import "../../../src/app/dome-case.css";
const data = {
  game: { id: "dome-review", stage: 3, success: true, team_suspect: "review" },
  case: { theme: "observatory", title: "El secreto de la cúpula" },
  suspects: [
    { id: "review", name: "Persona de revisión", portrait: "dome-nico" },
  ],
  solution: {
    suspect_id: "review",
    explanation: "Resultado ficticio de revisión.",
  },
} as RoomSnapshot;
createRoot(document.getElementById("root")!).render(
  <main className="shell" id="contenido">
    <h1>El secreto de la cúpula</h1>
    <p>
      Revisión visual con datos ficticios, sin sesión ni conexión a partidas.
    </p>
    <div className="suspect-grid">
      {Object.entries(domeCharacters).map(([key, c]) => (
        <article className="panel suspect" key={key}>
          <SuspectPortrait id={key} portrait={key} />
          <h2>{c.name}</h2>
        </article>
      ))}
    </div>
    <CaseEnding data={data} uid="review">
      <h2>Resultados de revisión</h2>
    </CaseEnding>
  </main>,
);
