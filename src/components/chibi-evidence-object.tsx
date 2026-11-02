import type { ReactNode } from "react";

/** Decorative objects only: clue contents remain in the authorized evidence card. */
const objects: Record<string, ReactNode> = {
  display: (
    <>
      <path
        d="M65 108V49Q65 39 76 36L119 23Q123 22 129 24L174 39Q181 41 181 50V108L124 132Z"
        fill="#bbdfe3"
      />
      <path d="m66 43 58 19 56-18M124 62v69" stroke="#89b6c7" />
      <path d="m77 99 47-14 44 14v29l-44 16-47-16Z" fill="#a895c7" />
      <path d="m77 99 47 17 44-17M124 116v28" />
      <path d="m85 51-8 22m19-18L84 87" stroke="#fff9ee" strokeWidth="7" />
      <path d="m116 91 8-9 9 9-9 11Z" fill="#f5d997" />
    </>
  ),
  clock: (
    <>
      <path d="m80 125-7 20m88-20 7 20" strokeWidth="10" />
      <path
        d="M83 34Q64 17 53 36l20 21m84-23q20-17 30 2l-20 21"
        fill="#b59bdc"
      />
      <circle cx="120" cy="86" r="58" fill="#b59bdc" />
      <circle cx="120" cy="86" r="47" fill="#fff2d3" />
      <path d="M120 48v6m38 32h-6m-32 38v-6M82 86h6M120 86l-17-13m17 13 22 9" />
      <circle cx="120" cy="86" r="5" fill="#e4af79" />
      <path d="M86 49q-20 16-19 34" stroke="#fff4ea" strokeWidth="6" />
    </>
  ),
  credential: (
    <>
      <path d="m104 31 4-18h25l4 18" fill="#b99ad7" />
      <rect x="63" y="29" width="115" height="117" rx="18" fill="#a8d8d0" />
      <rect x="74" y="41" width="93" height="94" rx="12" fill="#fff2dc" />
      <rect x="103" y="24" width="34" height="18" rx="7" fill="#d6b3e6" />
      <circle cx="105" cy="75" r="15" fill="#d1b5df" />
      <path d="M83 111q0-23 22-23t22 23Z" fill="#a4bbd9" />
      <path d="M139 70h15m-15 13h11m-70 40h72" stroke="#b89cc5" />
      <circle cx="150" cy="108" r="10" fill="#f4cf8d" />
    </>
  ),
  camera: (
    <>
      <path d="m91 49 8-19h43l9 19" fill="#b5a2d7" />
      <rect x="46" y="46" width="150" height="94" rx="23" fill="#a5c8dc" />
      <path d="M47 79h148v41q0 20-22 20H69q-22 0-22-20Z" fill="#9d8dbb" />
      <circle cx="122" cy="94" r="38" fill="#fae4bb" />
      <circle cx="122" cy="94" r="27" fill="#52658e" />
      <circle cx="122" cy="94" r="18" fill="#80b5cf" />
      <ellipse cx="115" cy="85" rx="9" ry="6" fill="#e9fcff" stroke="none" />
      <rect x="162" y="60" width="20" height="13" rx="4" fill="#fff2d4" />
      <path d="M65 59h13" stroke="#fff3e3" strokeWidth="6" />
    </>
  ),
  audio: (
    <>
      <rect x="55" y="43" width="131" height="98" rx="21" fill="#c8b5df" />
      <path d="m73 42 5-15h83l5 15" fill="#9a8ac1" />
      <rect x="70" y="58" width="100" height="42" rx="11" fill="#fff0d6" />
      <circle cx="94" cy="79" r="11" fill="#a3c9d5" />
      <circle cx="146" cy="79" r="11" fill="#a3c9d5" />
      <path d="M106 79h27M84 119h7m14 0h7m14 0h7m14 0h7" strokeWidth="6" />
      <path d="M47 49 35 31m157 17 12-20" stroke="#d1a4cb" />
    </>
  ),
  electrical: (
    <>
      <rect x="64" y="36" width="112" height="111" rx="22" fill="#a9cdbd" />
      <rect x="78" y="48" width="84" height="55" rx="12" fill="#fff1cd" />
      <path
        d="m125 56-20 25h19l-8 16 24-26h-20Z"
        fill="#e4b66f"
        strokeWidth="2"
      />
      <circle cx="91" cy="125" r="7" fill="#d3aedb" />
      <circle cx="149" cy="125" r="7" fill="#efb9a4" />
      <path d="M176 81q38 1 24 43t-28 19M64 69H48V47H34" />
      <path d="M84 40h17" stroke="#eaf7e5" strokeWidth="6" />
    </>
  ),
  report: (
    <>
      <path
        d="M71 39h90q13 0 13 13v82q0 13-13 13H71q-13 0-13-13V52q0-13 13-13Z"
        fill="#a9c7d7"
      />
      <path
        d="M74 29h76l20 21v76q0 9-10 9H74q-10 0-10-10V39q0-10 10-10Z"
        fill="#fff1d6"
      />
      <path d="M148 29v23h22M83 62h48m-48 17h62m-62 17h50" stroke="#ac97be" />
      <circle cx="148" cy="118" r="21" fill="#d5b6e4" />
      <path d="m138 118 7 7 13-15" stroke="#fff3df" strokeWidth="5" />
    </>
  ),
  paint: (
    <>
      <path
        d="m72 76 4-24h57l5 24v55q0 15-17 15H90q-18 0-18-15Z"
        fill="#d6afe0"
      />
      <rect x="73" y="44" width="64" height="20" rx="8" fill="#f0d09b" />
      <path d="M73 100h64v30q0 16-17 16H91q-18 0-18-16Z" fill="#e6c9ea" />
      <path d="m160 111 23-77q6-16 14-9t2 19l-31 72" fill="#d5ad78" />
      <path d="M160 103q-19 4-18 30 26 5 31-21Z" fill="#9bcaba" />
      <path d="M87 80v13" stroke="#fff6e3" strokeWidth="6" />
    </>
  ),
  phone: (
    <>
      <path
        d="M68 103q0-25 52-25t52 25l15 24q7 16-12 18H66q-20-2-12-18Z"
        fill="#bc9bce"
      />
      <path
        d="M69 54q51-34 102 0l-8 20q-5 8-18-1l-7-9q-19-8-35 0l-6 9q-14 9-19 0Z"
        fill="#b9d7d7"
      />
      <circle cx="120" cy="113" r="23" fill="#f5d69d" />
      <circle cx="120" cy="113" r="11" fill="#a88fc1" />
      <path d="M171 64q30 9 18 24t7 17" strokeWidth="5" />
      <path d="M88 48q12-5 24-5" stroke="#f2fbef" strokeWidth="6" />
    </>
  ),
  parcel: (
    <>
      <path d="m54 58 66-24 67 24v71l-67 20-66-20Z" fill="#e6c392" />
      <path d="m54 58 66 23 67-23M120 81v68" />
      <path d="m91 44 67 24v22l-19 6V75L73 51Z" fill="#b0d3ca" />
      <rect x="71" y="87" width="29" height="29" rx="6" fill="#fff0d5" />
      <path d="m79 103 5-5 8 3" stroke="#b7a4ca" />
      <path d="m149 115 21-7" stroke="#bd956d" strokeWidth="6" />
    </>
  ),
  timer: (
    <>
      <path d="M112 30V19h18v11m36 17 10-11" strokeWidth="10" />
      <circle cx="120" cy="88" r="57" fill="#b6a1dc" />
      <circle cx="120" cy="88" r="44" fill="#fff1d4" />
      <path d="M120 53v6m34 29h-6m-28 34v-6M86 88h6m28 0 17-20" />
      <circle cx="120" cy="88" r="5" fill="#dfa5b8" />
      <path d="M88 53q-14 13-17 29" stroke="#fff7ed" strokeWidth="6" />
    </>
  ),
  file: (
    <>
      <path
        d="M51 59V39q0-10 12-10h44l17 17h51q13 0 13 12v76q0 12-13 12H63q-12 0-12-12Z"
        fill="#b3a1d2"
      />
      <path
        d="M49 67q0-10 12-10h122q13 0 10 13l-12 65q-2 11-13 11H60q-11 0-11-12Z"
        fill="#f0d29e"
      />
      <circle cx="118" cy="96" r="23" fill="#b4d7d1" />
      <path d="m135 113 21 22" strokeWidth="8" />
      <path d="M104 88q4-7 12-7" stroke="#fff8e7" strokeWidth="5" />
    </>
  ),
  key: (
    <>
      <path
        d="m103 97 58 49q6 5 12-2l10-12-13-11-10 6-8-7 7-9-40-34"
        fill="#efd198"
      />
      <circle cx="90" cy="66" r="39" fill="#e9c58f" />
      <circle cx="90" cy="66" r="21" fill="#bcb1da" />
      <path d="M66 58q4-16 19-18" stroke="#fff3cf" strokeWidth="7" />
      <path
        d="m159 48 4-10 4 10 10 4-10 4-4 10-4-10-10-4Z"
        fill="#ddbbdf"
        stroke="none"
      />
    </>
  ),
  ticket: (
    <>
      <path d="M54 46h132v28q-17 9 0 20v30H54V95q17-10 0-21Z" fill="#c5b1de" />
      <path d="M65 54h108v20q-10 10 0 20v22H65V94q10-10 0-20Z" fill="#fff0d1" />
      <path d="M145 57v57" stroke="#b9a1c8" strokeDasharray="3 8" />
      <path
        d="M80 68h45m-45 16h34m-34 16h43"
        stroke="#a1b7c9"
        strokeWidth="5"
      />
      <path d="m156 80 7 4-7 5" stroke="#cfac78" />
    </>
  ),
  meal: (
    <>
      <ellipse cx="120" cy="120" rx="77" ry="27" fill="#c6d9e3" />
      <ellipse cx="120" cy="116" rx="62" ry="18" fill="#fff1dc" />
      <path d="M66 109a54 54 0 0 1 108 0Z" fill="#b5a4d7" />
      <path d="M112 54V42h17v12" strokeWidth="7" />
      <path d="M83 88q7-16 24-20" stroke="#f5e4f2" strokeWidth="7" />
      <path d="M51 109h139" stroke="#f0cc92" strokeWidth="8" />
    </>
  ),
  gem: (
    <>
      <path d="m76 57 24-25h41l25 25-46 77Z" fill="#82c3eb" />
      <path
        d="m76 57 44 77-20-77 20-25 21 25-21 77 46-77ZM76 57h90"
        stroke="#59638e"
      />
      <path d="m100 57 20-25-9 24Z" fill="#e5faff" stroke="none" />
    </>
  ),
  lens: (
    <>
      <path d="m84 51 36-16 36 16 14 45-50 40-50-40Z" fill="#a3d6de" />
      <path
        d="m84 51 36 16 36-16M120 67v69M70 96l50-29 50 29"
        stroke="#7686ad"
      />
      <path d="m87 60-5 29 20-18" fill="#e8ffef" stroke="none" />
    </>
  ),
  disk: (
    <>
      <circle cx="120" cy="85" r="59" fill="#b8a2d4" />
      <circle cx="120" cy="85" r="47" fill="#53658a" stroke="#f1cf93" />
      <path
        d="m120 47 10 25 27 3-20 18 6 27-23-14-23 14 5-27-19-18 27-3Z"
        fill="#f4d59b"
      />
      <circle cx="120" cy="85" r="7" fill="#53658a" />
    </>
  ),
};

export function ChibiEvidenceObject({ kind }: { kind: string }) {
  return (
    <svg
      className="chibi-object"
      data-object={Object.hasOwn(objects, kind) ? kind : "file"}
      viewBox="0 0 240 170"
      fill="none"
      stroke="#625273"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
    >
      <ellipse
        cx="120"
        cy="149"
        rx="77"
        ry="9"
        fill="#77618e"
        stroke="none"
        opacity=".16"
      />
      <path
        d="m38 50 3-8 3 8 8 3-8 3-3 8-3-8-8-3Zm158 57 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z"
        fill="#efcf91"
        stroke="none"
      />
      <g className="chibi-object-body">
        {Object.hasOwn(objects, kind) ? objects[kind] : objects.file}
      </g>
      <circle cx="190" cy="35" r="3" fill="#d6b8e4" stroke="none" />
    </svg>
  );
}
