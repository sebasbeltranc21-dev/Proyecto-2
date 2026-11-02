import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CaseEnding } from "../../../src/components/ending-cinematic";
import {
  EvidenceIllustration,
  SuspectPortrait,
} from "../../../src/components/case-art";
import { domeCharacters } from "../../../src/lib/dome-characters";
import { caseCharacters } from "../../../src/lib/chibi-characters";
import {
  casePresentation,
  type CaseTheme,
} from "../../../src/lib/case-presentation";
import type { RoomSnapshot } from "../../../src/lib/types";
import "../../../src/app/globals.css";
import "../../../src/app/investigation.css";
import "../../../src/app/office-room.css";
import "../../../src/app/chibi-ui.css";
import "../../../src/app/dome-case.css";
const titles: Record<CaseTheme, string> = {
  museum: "La última luz del museo",
  train: "El Expreso Medianoche",
  theater: "El último acto",
  lighthouse: "La señal de medianoche",
  observatory: "El secreto de la cúpula",
};
function Review() {
  const [theme, setTheme] = useState<CaseTheme>("observatory");
  const cast =
    theme === "observatory"
      ? Object.entries(domeCharacters).map(([portrait, c]) => ({
          ...c,
          portrait,
        }))
      : Object.values(caseCharacters)
          .filter((c) => c.image.includes(`/cast/${theme}-`))
          .map((c) => ({ ...c, portrait: "" }));
  const data = {
    game: {
      id: `chibi-review-${theme}`,
      stage: 3,
      success: true,
      team_suspect: "review-1",
    },
    case: { theme, title: titles[theme] },
    suspects: cast.map((c, i) => ({
      id: `review-${i}`,
      name: c.name,
      portrait: c.portrait,
    })),
    solution: {
      suspect_id: "review-1",
      explanation:
        "Resultado ficticio de revisión; no representa la solución de una partida.",
    },
  } as RoomSnapshot;
  return (
    <main className="shell" id="contenido">
      <h1>{titles[theme]}</h1>
      <p>
        Revisión visual con datos ficticios, sin sesión ni conexión a partidas.
      </p>
      <label htmlFor="review-case">Caso de revisión</label>
      <select
        id="review-case"
        value={theme}
        onChange={(e) => setTheme(e.target.value as CaseTheme)}
      >
        {Object.keys(casePresentation).map((key) => (
          <option key={key} value={key}>
            {titles[key as CaseTheme]}
          </option>
        ))}
      </select>
      <div className="suspect-grid">
        {cast.map((c) => (
          <article className="panel suspect" key={c.name}>
            <SuspectPortrait id={c.name} name={c.name} portrait={c.portrait} />
            <h2>{c.name}</h2>
          </article>
        ))}
      </div>
      <CaseEnding key={theme} data={data} uid="review">
        <h2>Resultados de revisión</h2>
      </CaseEnding>
      <h2>Objetos de evidencia</h2>
      <div className="suspect-grid">
        {[
          "Vitrina",
          "Noventa segundos",
          "Credencial",
          "Cámara",
          "Audio",
          "Técnico",
          "Informe",
          "Barniz",
          "Llamada",
          "Embalaje",
          "Temporizador",
          "Documento",
          "Llave",
          "Trayecto",
          "Restaurante",
        ].map((title) => (
          <article className="panel" key={title}>
            <h3>{title}</h3>
            <EvidenceIllustration title={title} />
          </article>
        ))}
      </div>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Review />);
