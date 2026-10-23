import type { CSSProperties, ReactNode } from "react";
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
  presentation = "dossier",
  expression = "neutral",
  pose = "relaxed",
}: {
  id: string;
  portrait?: string;
  presentation?: "dossier" | "scene";
  expression?: CharacterExpression;
  pose?: CharacterPose;
}) {
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

const drawings: Record<string, ReactNode> = {
  display: (
    <>
      <path
        d="M59 99V41L120 22L181 41V99L120 121Z"
        fill="#c6d5ce"
        fillOpacity=".5"
      />
      <path d="M59 41L120 65L181 41M120 65V121M59 99L120 81L181 99" />
      <path
        d="M74 105V135H167V105M74 135L120 151L167 135M120 121V151"
        fill="#c5b99e"
      />
      <path d="M109 80L120 73L131 80L120 92Z" strokeDasharray="3 4" />
      <path d="M91 50L79 69M100 54L88 73" stroke="#f7f3e5" strokeWidth="4" />
    </>
  ),
  clock: (
    <>
      <circle cx="120" cy="83" r="54" fill="#e9e1cf" />
      <circle cx="120" cy="83" r="46" strokeDasharray="1 11" />
      <path d="M120 83L94 75M120 83L151 90" strokeWidth="4" />
      <circle cx="120" cy="83" r="4" fill="currentColor" />
      <path d="M174 29L164 44M178 45L187 38M66 119L55 133M80 135L77 145" />
      <path
        d="M42 49L48 39L44 31L58 22L54 40L60 43Z"
        fill="#c9a75c"
        stroke="none"
      />
    </>
  ),
  credential: (
    <>
      <path d="M105 48L97 21Q121 7 143 21L134 48" />
      <rect x="70" y="45" width="100" height="98" rx="9" fill="#d7d6b9" />
      <path d="M110 57H131M129 83H154M129 93H149M85 119H155M85 128H143" />
      <circle cx="103" cy="84" r="9" fill="#b5bda0" />
      <path d="M88 106Q90 94 103 94Q116 94 118 106" fill="#b5bda0" />
      <path d="M171 57L185 48M178 70L193 68" opacity=".5" />
    </>
  ),
  camera: (
    <>
      <path d="M68 61L91 48L161 66L144 109L71 92Z" fill="#b8c9c5" />
      <path d="M144 109L174 92L187 63L161 66M174 92L144 78M72 62L144 78L161 66" />
      <path d="M112 104L106 124H77V144H98M77 135H58V116H77" strokeWidth="5" />
      <ellipse
        cx="167"
        cy="83"
        rx="8"
        ry="13"
        transform="rotate(28 167 83)"
        fill="#5a746e"
      />
      <path
        d="M193 84L205 90M189 100L198 112M180 111L184 125"
        strokeDasharray="3 5"
        opacity=".5"
      />
      <circle
        className="art-signal"
        cx="135"
        cy="89"
        r="3"
        fill="#a85f42"
        stroke="none"
      />
    </>
  ),
  audio: (
    <>
      <rect x="47" y="43" width="146" height="87" rx="9" fill="#c6cbb6" />
      <path d="M63 53H177V91H63ZM79 130L84 110H157L163 130" fill="#e9e1cf" />
      <circle cx="89" cy="73" r="10" />
      <circle cx="151" cy="73" r="10" />
      <path d="M100 73H140M99 120H141" />
      <g className="art-wave">
        <path
          d="M85 23V32M99 17V35M113 22V31M127 13V37M141 19V33M155 23V29"
          stroke="#6e8a78"
        />
      </g>
    </>
  ),
  electrical: (
    <>
      <rect x="69" y="22" width="104" height="124" rx="5" fill="#b9c3b7" />
      <path d="M82 37H160V132H82Z" />
      <path
        d="M92 50H108V71H92ZM124 50H140V71H124ZM92 84H108V105H92ZM124 84H140V105H124Z"
        fill="#e8dfce"
      />
      <path d="M100 56V66M132 56V66M100 90V99M132 90V99" strokeWidth="4" />
      <path d="M111 117L107 124H114L110 131" stroke="#9a763a" />
      <path d="M55 38L41 47V132L55 143" />
    </>
  ),
  report: (
    <>
      <path d="M77 23H148L169 45V144H77Z" fill="#eee4cd" />
      <path d="M148 23V45H169M93 55H132M93 66H152M93 78H143M93 91H151M93 103H124" />
      <circle cx="145" cy="119" r="16" fill="#b5bda0" fillOpacity=".5" />
      <path d="M137 119L143 125L154 113M60 48V132H67" />
    </>
  ),
  paint: (
    <>
      <path
        d="M79 93Q96 71 123 91Q135 101 154 91Q173 103 161 121Q137 138 111 127Q89 142 72 124Q59 110 79 93Z"
        fill="#8caebc"
        stroke="none"
      />
      <path
        d="M101 82L141 23Q147 16 153 23Q157 26 152 33L114 92"
        fill="#c5ad7e"
      />
      <path d="M101 82L114 92Q111 111 91 114Q103 102 99 95Z" fill="#7398a8" />
      <path d="M157 52L171 75Q174 89 159 91Q144 88 146 76Z" fill="#91b1bc" />
      <path d="M78 123Q93 127 105 120M143 112L153 109" stroke="#e2eef0" />
    </>
  ),
  phone: (
    <>
      <rect x="86" y="19" width="69" height="130" rx="11" fill="#bbc6bd" />
      <path d="M94 36H147V128H94Z" fill="#d9e0d0" />
      <path d="M113 28H130M117 138H125" />
      <path
        d="M107 65Q103 81 126 100L136 94L130 83L123 88L116 78L120 72L113 61Z"
        fill="#78988a"
      />
      <path d="M167 55Q181 72 167 89M178 44Q201 72 178 100" opacity=".5" />
    </>
  ),
  parcel: (
    <>
      <path d="M53 65L120 34L187 63V122L120 153L53 124Z" fill="#c6ae82" />
      <path
        d="M53 65L120 94L187 63M120 94V153M87 49L153 79V109L139 115V85L73 56"
        fill="#e6d7b4"
      />
      <path d="M65 97L102 113V132L65 116Z" fill="#eee4cd" />
      <path d="M72 108L91 116M133 130L153 121" />
      <path d="M183 36L194 27M174 29L180 14M192 49L207 45" opacity=".5" />
    </>
  ),
  timer: (
    <>
      <rect x="61" y="39" width="117" height="102" rx="8" fill="#bdc4b4" />
      <path d="M75 52H164V94H75Z" fill="#e8dfce" />
      <path
        d="M84 62H101V83H84ZM112 62H129V83H112ZM140 62H154M140 73H154M140 83H154"
        stroke="#7f9279"
      />
      <circle cx="91" cy="116" r="9" />
      <circle cx="149" cy="116" r="9" />
      <path d="M91 116L95 111M149 116L145 111M110 39V26Q128 11 143 26M119 141V153" />
    </>
  ),
  file: (
    <>
      <path d="M51 52V36H110L122 48H187V136H51Z" fill="#c9bb98" />
      <path d="M51 62H187L177 142H42Z" fill="#e5d8bb" />
      <circle cx="117" cy="94" r="19" fill="#d4d7c0" />
      <path d="M132 109L152 129M89 63H139" />
    </>
  ),
  key: (
    <>
      <circle cx="91" cy="66" r="28" fill="#ccba86" />
      <circle cx="91" cy="66" r="11" fill="#e7dfc8" />
      <path
        d="M110 85L163 137L180 120L168 108L157 119L145 106L153 98L139 84L130 92L117 78"
        fill="#ccba86"
      />
      <path d="M61 45L51 35M59 68H43M70 32L66 21" opacity=".4" />
    </>
  ),
  ticket: (
    <>
      <path
        d="M44 60L176 29L196 117L64 147L58 121Q72 114 66 101Q60 88 53 94Z"
        fill="#e8d9b7"
      />
      <path d="M144 39L164 124" strokeDasharray="3 6" />
      <path d="M65 70L125 55M70 86L130 72M76 111L115 102" />
      <path d="M157 52L169 106M164 51L177 105M171 49L184 103" strokeWidth="4" />
    </>
  ),
  meal: (
    <>
      <ellipse cx="120" cy="89" rx="48" ry="43" fill="#e9e2cd" />
      <ellipse cx="120" cy="89" rx="33" ry="29" />
      <path
        d="M52 35V79Q64 92 76 79V35M64 35V142M58 35V67M70 35V67M188 35Q165 48 176 88H188V142M188 35V88"
        fill="#c6ccb8"
      />
      <path
        d="M109 84Q122 64 135 84Q143 101 122 109Q100 101 109 84Z"
        fill="#afb995"
      />
    </>
  ),
};

// Classify only the title already delivered to this player. Unknown cases get
// a neutral folder; this module never contains unrevealed clue text or answers.
function illustrationFor(title: string) {
  const name = title.toLocaleLowerCase("es");
  if (name.includes("vitrina")) return "display";
  if (name.includes("noventa")) return "clock";
  if (name.includes("acceso c-04")) return "credential";
  if (name.includes("cámara") || name.includes("coartada")) return "camera";
  if (name.includes("audio")) return "audio";
  if (name.includes("técnico")) return "electrical";
  if (name.includes("credenciales")) return "report";
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
    <div className="evidence-art" aria-hidden="true">
      <span className="art-note">APUNTE DE CAMPO</span>
      <div className="evidence-drawing">
        <svg
          viewBox="0 0 240 170"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <ellipse
            cx="120"
            cy="146"
            rx="79"
            ry="6"
            fill="currentColor"
            stroke="none"
            opacity=".07"
          />
          {drawings[illustrationFor(title)]}
        </svg>
      </div>
      <span className="art-cross art-cross-left">+</span>
      <span className="art-cross art-cross-right">+</span>
    </div>
  );
}
