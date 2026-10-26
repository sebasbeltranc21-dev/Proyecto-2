import React from "react";
import { createRoot } from "react-dom/client";
import { FloatingChat } from "../../../src/components/floating-chat";
import { InvestigatorCompanion } from "../../../src/components/investigator-companion";
import "../../../src/app/investigation.css";
createRoot(document.getElementById("root")!).render(
  <main className="room-page room-sidebar">
    <p>
      Revisión de interfaz con datos ficticios; sin sesión ni transporte real.
    </p>
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
