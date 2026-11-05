import React from "react";
import { OfficeHub } from "../../../src/components/office-hub";
import type { HomeSnapshot } from "../../../src/lib/types";
import { FinalBallots } from "../../../src/components/final-ballots";
import type { RoomSnapshot } from "../../../src/lib/types";
import { createRoot } from "react-dom/client";
import { FloatingChat } from "../../../src/components/floating-chat";
import { InvestigatorCompanion } from "../../../src/components/investigator-companion";
import "../../../src/app/investigation.css";
import "../../../src/app/office-room.css";
import "../../../src/app/chibi-ui.css";
import "../../../src/app/lighthouse-case.css";
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
  const data: HomeSnapshot = {
    profile: { id: "review", name: "Agente de revisión", avatar: "lupa" },
    rooms: [],
    history: [],
    stats: { games: 3, correct: 1, points: 150 },
    leaderboard: [],
    progression: {
      played: 3,
      completed: 3,
      wins: 1,
      shared_clues: 2,
      rank_index: 2,
      achievements: { first_case: "2026-11-01T12:00:00Z" },
    },
    cases: [
      {
        slug: "ultima-luz",
        theme: "museum",
        title: "Museo de revisión",
        intro: "Caso de prueba",
        suspect_count: 4,
      },
      {
        slug: "expreso-medianoche",
        theme: "train",
        title: "Expreso de revisión",
        intro: "Caso de prueba",
        suspect_count: 4,
      },
      {
        slug: "ultimo-acto",
        theme: "theater",
        title: "Teatro de revisión",
        intro: "Caso de prueba",
        suspect_count: 4,
      },
      {
        slug: "senal-medianoche",
        theme: "lighthouse",
        title: "Faro de revisión",
        intro: "Caso de prueba",
        suspect_count: 4,
      },
    ],
  };
  return <OfficeHub data={data} />;
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
