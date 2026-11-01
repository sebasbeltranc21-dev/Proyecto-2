import React, { useState } from "react";
import { OfficeHub } from "../../../src/components/office-hub";
import type { HomeSnapshot } from "../../../src/lib/types";
import { FinalBallots } from "../../../src/components/final-ballots";
import type { RoomSnapshot } from "../../../src/lib/types";
import { createRoot } from "react-dom/client";
import { FloatingChat } from "../../../src/components/floating-chat";
import { InvestigatorCompanion } from "../../../src/components/investigator-companion";
import "../../../src/app/investigation.css";
const report = {
  game: { stage: 3 },
  suspects: [{ id: "fictional", name: "Responsable ficticio" }],
  solution: { suspect_id: "fictional" },
  results: [
    {
      user_id: "a",
      name: "Agente ficticio A",
      suspect_id: "fictional",
      correct: true,
      points: 150,
    },
    {
      user_id: "b",
      name: "Agente ficticio B",
      suspect_id: null,
      correct: false,
      points: 50,
    },
  ],
} as RoomSnapshot;
function OfficeReview() {
  const [selected, setSelected] = useState("ultima-luz");
  const data = {
    profile: { name: "Agente de revisión", avatar: "lupa" },
    cases: [
      { slug: "ultima-luz", theme: "museum", title: "Museo de revisión" },
      {
        slug: "expreso-medianoche",
        theme: "train",
        title: "Expreso de revisión",
      },
      { slug: "ultimo-acto", theme: "theater", title: "Teatro de revisión" },
    ],
  } as HomeSnapshot;
  return <OfficeHub data={data} selected={selected} onSelect={setSelected} />;
}
createRoot(document.getElementById("root")!).render(
  <main className="room-page room-sidebar">
    <p>
      Revisión de interfaz con datos ficticios; sin sesión ni transporte real.
    </p>
    <OfficeReview />
    <FinalBallots data={report} uid="a" />
    <InvestigatorCompanion kind="lupa" />
    <FloatingChat messageCount={1}>
      <section className="panel chat-panel">
        <div className="chat-messages">
          <p>Mensaje ficticio de revisión</p>
        </div>
        <form>
          <textarea aria-label="Tu teoría" />
          <button>Enviar</button>
        </form>
      </section>
    </FloatingChat>
  </main>,
);
