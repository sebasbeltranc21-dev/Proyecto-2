import type { CSSProperties } from "react";
import Image from "next/image";
import { chibiCharacter } from "@/lib/chibi-characters";
import { ChibiEvidenceObject } from "./chibi-evidence-object";
import {
  CharacterFigure,
  type CharacterExpression,
  type CharacterPose,
} from "./character-figure";

// Only public character IDs and visual attributes live here. Clue bodies and
// their visibility continue to come exclusively from the authorized snapshot.
const characters: Record<string, { kind: string; color: string }> = {
  "20000000-0000-4000-8000-000000000001": {
    kind: "restorer",
    color: "#b5bda0",
  },
  "20000000-0000-4000-8000-000000000002": { kind: "guard", color: "#98b8be" },
  "20000000-0000-4000-8000-000000000003": {
    kind: "reporter",
    color: "#d4a790",
  },
  "20000000-0000-4000-8000-000000000004": {
    kind: "collector",
    color: "#c4add1",
  },
};

const portraitStyles: Record<string, { kind: string; color: string }> = {
  restorer: { kind: "restorer", color: "#b5bda0" },
  guard: { kind: "guard", color: "#98b8be" },
  reporter: { kind: "reporter", color: "#d4a790" },
  collector: { kind: "collector", color: "#c4add1" },
  conductor: { kind: "conductor", color: "#92b8b2" },
  mechanic: { kind: "mechanic", color: "#c7a773" },
  photographer: { kind: "photographer", color: "#b9a8ca" },
  chef: { kind: "chef", color: "#d6d9c8" },
  traveler: { kind: "traveler", color: "#97acbd" },
  agent: { kind: "agent", color: "#7b93ad" },
  investigator: { kind: "investigator", color: "#b09d70" },
};
export function SuspectPortrait({
  id,
  portrait,
  name,
  presentation = "dossier",
  expression = "neutral",
  pose = "relaxed",
}: {
  id: string;
  portrait?: string;
  name?: string;
  presentation?: "dossier" | "scene";
  expression?: CharacterExpression;
  pose?: CharacterPose;
}) {
  const chibi = chibiCharacter(name, portrait);
  if (chibi)
    return (
      <div
        className={`suspect-art chibi-suspect ${presentation === "scene" ? "portrait-scene" : ""}`}
        aria-hidden="true"
      >
        <Image
          src={chibi.image}
          alt=""
          width={420}
          height={600}
          sizes="(max-width: 600px) 45vw, 300px"
        />
      </div>
    );
  const { kind, color } = portraitStyles[portrait ?? ""] ??
    characters[id] ?? {
      kind: "unknown",
      color: "#b7b4a0",
    };
  return (
    <div
      className={`suspect-art ${presentation === "scene" ? "portrait-scene" : ""}`}
      style={{ "--portrait-accent": color } as CSSProperties}
    >
      {presentation === "dossier" && (
        <div className="portrait-halo" aria-hidden="true" />
      )}
      <div className="portrait-drawing">
        <CharacterFigure
          kind={kind}
          fullBody={presentation === "scene"}
          expression={expression}
          pose={pose}
        />
      </div>
      {presentation === "dossier" && (
        <span className="portrait-annotation" aria-hidden="true">
          RETRATO / ARCHIVO
        </span>
      )}
    </div>
  );
}

// Classify only the title already delivered to this player. Unknown cases get
// a neutral folder; this module never contains unrevealed clue text or answers.
function illustrationFor(title: string) {
  const name = title.toLocaleLowerCase("es");
  if (/tarjeta|credencial/.test(name)) return "credential";
  if (/piano|ensayo|audio|radio/.test(name)) return "audio";
  if (/grab|rostro|espejo|recorrido|pasillo/.test(name)) return "camera";
  if (/carro|caja|muelle/.test(name)) return "parcel";
  if (/partitura|nota|programa|registro/.test(name)) return "report";
  if (/vestuario/.test(name)) return "paint";
  if (/reloj/.test(name)) return "clock";
  if (name.includes("soporte")) return "display";
  if (
    name.includes("sensor") ||
    name.includes("calibración") ||
    name.includes("prueba anunciada")
  )
    return "electrical";
  if (name.includes("recibo")) return "ticket";
  if (name.includes("oferta")) return "report";
  if (
    name.includes("cajas") ||
    name.includes("bulto") ||
    name.includes("aurora recuperada")
  )
    return "parcel";
  if (name.includes("hora de la retirada")) return "clock";
  if (name.includes("dos puestos") || name.includes("de la galería"))
    return "camera";
  if (name.includes("vitrina")) return "display";
  if (name.includes("noventa")) return "clock";
  if (name.includes("acceso c-04")) return "credential";
  if (name.includes("cámara") || name.includes("coartada")) return "camera";
  if (name.includes("audio")) return "audio";
  if (name.includes("técnico")) return "electrical";
  if (name.includes("barniz")) return "paint";
  if (name.includes("llamada")) return "phone";
  if (name.includes("embalaje")) return "parcel";
  if (name.includes("temporizador")) return "timer";
  if (name.includes("reloj") || name.includes("orden diferida")) return "timer";
  if (name.includes("precinto")) return "electrical";
  if (name.includes("trayecto")) return "ticket";
  if (name.includes("llave")) return "key";
  if (name.includes("reflejo") || name.includes("registro de tomás"))
    return "camera";
  if (name.includes("foto")) return "camera";
  if (name.includes("comanda") || name.includes("informe")) return "report";
  if (name.includes("restaurante")) return "meal";
  return "file";
}

export function EvidenceIllustration({ title }: { title: string }) {
  return (
    <div className="evidence-art chibi-evidence" aria-hidden="true">
      <span className="art-note">APUNTE DE CAMPO</span>
      <div className="evidence-drawing">
        <ChibiEvidenceObject kind={illustrationFor(title)} />
      </div>
      <span className="art-cross art-cross-left">+</span>
      <span className="art-cross art-cross-right">+</span>
    </div>
  );
}
