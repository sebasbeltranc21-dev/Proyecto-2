"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Film,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import type { RoomSnapshot, Suspect } from "@/lib/types";
import { SuspectPortrait } from "./case-art";

const SCENE_MS = 3500;
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeMotion(notify: () => void) {
  const query = window.matchMedia?.(MOTION_QUERY);
  query?.addEventListener("change", notify);
  return () => query?.removeEventListener("change", notify);
}
function reducedMotion() {
  return window.matchMedia?.(MOTION_QUERY).matches ?? false;
}
function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}
function visible() {
  return document.visibilityState !== "hidden";
}
function wasSeen(key: string) {
  try {
    return (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(key) === "seen"
    );
  } catch {
    return false;
  }
}

// The authoritative snapshot is the only source of the culprit and outcome.
// Before closure (or without an official solution), no ending is mounted.
export function CaseEnding({
  data,
  uid,
  children,
}: {
  data: RoomSnapshot;
  uid: string;
  children?: ReactNode;
}) {
  const responsible = data.suspects.find(
    (s) => s.id === data.solution?.suspect_id,
  );
  if (data.game?.stage !== 3 || !data.solution || !responsible)
    return <>{children}</>;
  return (
    <EndingSession
      key={`${uid}:${data.game.id}`}
      gameId={data.game.id}
      uid={uid}
      theme={data.case.theme}
      title={data.case.title}
      responsible={responsible}
      won={
        data.game.success === true && data.game.team_suspect === responsible.id
      }
      accused={
        data.suspects.find((s) => s.id === data.game?.team_suspect)?.name
      }
    >
      {children}
    </EndingSession>
  );
}

function EndingSession({
  gameId,
  uid,
  theme,
  title,
  responsible,
  won,
  accused,
  children,
}: {
  gameId: string;
  uid: string;
  theme: "museum" | "train";
  title: string;
  responsible: Suspect;
  won: boolean;
  accused?: string;
  children: ReactNode;
}) {
  const storageKey = `mm:ending:v1:${uid}:${gameId}`;
  // GameRoom mounts this only after its client-side snapshot has arrived.
  const [playing, setPlaying] = useState(() => !wasSeen(storageKey));
  const result = useRef<HTMLDivElement>(null);
  const focusResult = useRef(false);
  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem(storageKey, "seen");
    } catch {
      /* Storage is optional; results must stay accessible. */
    }
    focusResult.current = true;
    setPlaying(false);
  }, [storageKey]);
  useEffect(() => {
    if (!playing && focusResult.current) {
      result.current?.focus({ preventScroll: true });
      focusResult.current = false;
    }
  }, [playing]);
  return playing ? (
    <CinematicPlayer
      theme={theme}
      title={title}
      responsible={responsible}
      won={won}
      accused={accused}
      onFinish={finish}
    />
  ) : (
    <div
      ref={result}
      tabIndex={-1}
      className="ending-results"
      role="region"
      aria-label="Resultados de la partida"
    >
      <div className="ending-replay">
        <span>
          <Film size={17} aria-hidden="true" />
          El último acto · {won ? "Caso resuelto" : "Caso sin resolver"}
        </span>
        <button className="button secondary" onClick={() => setPlaying(true)}>
          <RotateCcw size={15} />
          Volver a ver la cinemática
        </button>
      </div>
      {children}
    </div>
  );
}

function story(
  theme: "museum" | "train",
  won: boolean,
  responsible: string,
  accused?: string,
) {
  const train = theme === "train";
  if (won)
    return [
      {
        title: train
          ? "El amanecer llega al andén."
          : "La sala queda en silencio.",
        text: train
          ? "Con el tren a salvo, el equipo reúne el expediente. Los agentes esperan en el andén."
          : "Los investigadores reúnen las pruebas junto a la vitrina. Esta vez, todas las piezas encajan.",
      },
      {
        title: "Las pruebas señalan un nombre.",
        text: `El equipo presenta sus hallazgos. La investigación identifica a ${responsible} como responsable.`,
      },
      {
        title: "Los agentes cierran el paso.",
        text: train
          ? `Los agentes se acercan a ${responsible} antes de abandonar la estación.`
          : `Los agentes interceptan a ${responsible} junto a la salida del museo.`,
      },
      {
        title: "El expediente se cierra.",
        text: train
          ? `${responsible} queda bajo custodia. Mientras amanece, el Expreso Medianoche se prepara para continuar.`
          : `${responsible} queda bajo custodia. Los agentes protegen la joya y el museo recupera la calma.`,
      },
    ];
  return [
    {
      title: train
        ? "El tren espera una respuesta."
        : "Las luces siguen encendidas.",
      text: "La investigación ha terminado. El equipo entrega sus conclusiones, pero el caso sigue abierto.",
    },
    {
      title: accused
        ? "La acusación no encaja."
        : "Faltó una conclusión común.",
      text: accused
        ? `El equipo señaló a ${accused}. La revisión de las pruebas no respalda esa acusación.`
        : "El empate o la ausencia de votos dejó al equipo sin una acusación única.",
    },
    {
      title: "Una pieza quedó fuera de lugar.",
      text: "Los investigadores revisan el expediente. Esta vez no habrá una detención como resultado de vuestra acusación.",
    },
    {
      title: "La verdad espera en el expediente.",
      text: `La solución oficial identifica a ${responsible}. Revisad las pistas y descubrid cómo se podía llegar a la verdad.`,
    },
  ];
}

function CinematicPlayer({
  theme,
  title,
  responsible,
  won,
  accused,
  onFinish,
}: {
  theme: "museum" | "train";
  title: string;
  responsible: Suspect;
  won: boolean;
  accused?: string;
  onFinish: () => void;
}) {
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useSyncExternalStore(
    subscribeMotion,
    reducedMotion,
    () => true,
  );
  const foreground = useSyncExternalStore(
    subscribeVisibility,
    visible,
    () => false,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const frames = story(theme, won, responsible.name, accused);
  const automatic = !paused && !reduce && foreground;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (!automatic) return;
    const timer = setTimeout(() => {
      if (frame === 3) onFinish();
      else setFrame((current) => current + 1);
    }, SCENE_MS);
    return () => clearTimeout(timer);
  }, [frame, automatic, onFinish]);
  function next() {
    if (frame === 3) onFinish();
    else setFrame((current) => current + 1);
  }
  return (
    <section
      className="ending-player panel"
      aria-label="Cinemática final"
      data-paused={!automatic}
      data-reduced={reduce}
    >
      <div className="ending-player-top">
        <div>
          <p className="eyebrow">
            EL ÚLTIMO ACTO / {won ? "CASO RESUELTO" : "CASO SIN RESOLVER"}
          </p>
          <h2 ref={heading} tabIndex={-1}>
            {title}
          </h2>
        </div>
        <span className="ending-duration">
          <Film size={16} aria-hidden="true" />
          {reduce ? "A tu ritmo" : "14 s"}
        </span>
      </div>
      <div
        className="ending-screen"
        data-scene={frame}
        data-theme={theme}
        data-outcome={won ? "solved" : "open"}
        aria-hidden="true"
      >
        <div className="ending-camera">
          <EndingBackdrop theme={theme} recovered={won && frame === 3} />
          <div className="ending-presenter">
            <EndingActor portrait="investigator" id="investigator" />
          </div>
          <div className="ending-file">
            <svg viewBox="0 0 72 90" fill="none" focusable="false">
              <path
                d="M9 8H48L63 24V81H9Z"
                fill="#e6d8b5"
                stroke="#526250"
                strokeWidth="3"
              />
              <path
                d="M48 8V24H63M20 37H50M20 47H50M20 57H42"
                stroke="#75836a"
                strokeWidth="3"
              />
              <circle cx="46" cy="68" r="7" stroke="#9b7744" strokeWidth="3" />
            </svg>
          </div>
          {!won && frame < 3 && <div className="ending-question">?</div>}
          <div className="ending-escort" data-detained={won && frame >= 2}>
            {(won ? frame >= 1 : frame === 3) && (
              <div className="ending-culprit">
                <EndingActor
                  id={responsible.id}
                  portrait={responsible.portrait}
                  detained={won && frame >= 2}
                  identified={won}
                />
              </div>
            )}
            {won && frame >= 2 && (
              <>
                <div className="ending-agent ending-agent-left">
                  <EndingActor id="agent-one" portrait="agent" />
                </div>
                <div className="ending-agent ending-agent-right">
                  <EndingActor id="agent-two" portrait="agent" />
                </div>
              </>
            )}
          </div>
        </div>
        <span className="ending-shot">
          {
            ["PLANO GENERAL", "EL EXPEDIENTE", "EL DESENLACE", "ÚLTIMA ESCENA"][
              frame
            ]
          }
        </span>
        <span className="ending-scene-number">0{frame + 1} / 04</span>
      </div>
      <div
        className="ending-caption"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <h3>{frames[frame].title}</h3>
        <p>{frames[frame].text}</p>
      </div>
      <ol className="ending-progress" aria-label="Escenas de la cinemática">
        {frames.map((item, index) => (
          <li
            key={item.title}
            aria-current={index === frame ? "step" : undefined}
            className={index < frame ? "done" : ""}
          >
            <span className="sr-only">
              Escena {index + 1}: {item.title}
            </span>
            <i />
          </li>
        ))}
      </ol>
      <div className="ending-controls">
        <div>
          {!reduce && (
            <button
              className="button secondary"
              onClick={() => setPaused((current) => !current)}
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
              {paused ? "Continuar" : "Pausar"}
            </button>
          )}
          <button className="button secondary" onClick={next}>
            {frame === 3 ? "Ver resultados" : "Siguiente escena"}
            <ArrowRight size={15} />
          </button>
        </div>
        <button className="button quiet" onClick={onFinish}>
          <SkipForward size={15} />
          Omitir cinemática
        </button>
      </div>
      <p className="ending-help">
        {reduce
          ? "Movimiento reducido: escenas estáticas. Avanza cuando quieras."
          : !foreground
            ? "La reproducción espera mientras esta pestaña está oculta."
            : paused
              ? "Reproducción pausada. Puedes avanzar escena por escena."
              : "Una historieta animada del desenlace. Puedes pausarla u omitirla."}
      </p>
    </section>
  );
}

function EndingActor({
  id,
  portrait,
  detained = false,
  identified = false,
}: {
  id: string;
  portrait?: string;
  detained?: boolean;
  identified?: boolean;
}) {
  return (
    <div className="ending-actor">
      <SuspectPortrait
        id={id}
        portrait={portrait}
        presentation="scene"
        expression={detained ? "worried" : identified ? "alert" : "neutral"}
        pose={
          detained
            ? "detained"
            : id === "investigator"
              ? "presenting"
              : "relaxed"
        }
      />
    </div>
  );
}

function EndingBackdrop({
  theme,
  recovered,
}: {
  theme: "museum" | "train";
  recovered: boolean;
}) {
  return (
    <svg
      className="ending-backdrop"
      viewBox="0 0 960 440"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      focusable="false"
    >
      {theme === "museum" ? (
        <>
          <path fill="#203532" d="M0 0H960V440H0Z" />
          <path fill="#1b2b28" d="M0 318H960V440H0Z" />
          <path
            d="M0 318H960M480 318L210 440M480 318L730 440M0 379H960"
            stroke="#718173"
            strokeOpacity=".3"
            strokeWidth="2"
          />
          <path
            d="M60 42H116V316H60ZM427 42H483V316H427ZM777 42H833V316H777Z"
            fill="#52645a"
          />
          <path
            d="M51 42H126M417 42H493M767 42H843M51 316H126M417 316H493M767 316H843"
            stroke="#849383"
            strokeWidth="9"
          />
          <path d="M88 0L220 305H6Z" fill="#e6d5a5" fillOpacity=".06" />
          <path
            d="M844 100H934V320H844Z"
            fill="#0c1a19"
            stroke="#a1976e"
            strokeWidth="3"
          />
          <path d="M858 116H918V300H858Z" stroke="#42574a" />
          <path d="M163 248H283V344H163Z" fill="#817b60" />
          <path
            d="M153 152L224 128L295 152V248L224 272L153 248Z"
            fill="#a5c3ad"
            fillOpacity=".15"
            stroke="#b4c9af"
            strokeWidth="3"
          />
          <path
            d="M153 152L224 177L295 152M224 177V272"
            stroke="#b4c9af"
            strokeWidth="2"
          />
          {recovered && (
            <path
              d="M209 219L224 209L240 219L224 240Z"
              fill="#8cb9d5"
              stroke="#dce9e3"
              strokeWidth="2"
            />
          )}
          <path
            d="M177 177L165 203M185 180L173 206"
            stroke="#e4ebcd"
            strokeWidth="3"
            opacity=".5"
          />
          <path
            d="M0 39H960M0 71H960"
            stroke="#91a086"
            strokeOpacity=".22"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path fill="#707e79" d="M0 0H960V440H0Z" />
          <path
            fill="#d1bd88"
            fillOpacity=".55"
            d="M0 125Q300 20 960 112V249H0Z"
          />
          <circle cx="776" cy="105" r="38" fill="#e6d6a4" />
          <path
            d="M0 172L175 82L348 161L534 69L727 163L960 98V257H0Z"
            fill="#415e59"
          />
          <path
            d="M0 211Q130 182 282 203T590 194T960 201V291H0Z"
            fill="#254540"
          />
          <path d="M0 296H960V440H0Z" fill="#3a4c46" />
          <path d="M0 327H960M0 339H960" stroke="#bdb58b" strokeWidth="3" />
          <path
            d="M0 165Q14 145 48 145H627Q659 145 659 175V302H0Z"
            fill="#294a49"
            stroke="#879284"
            strokeWidth="3"
          />
          <path d="M0 245H658M0 255H658" stroke="#baa570" strokeWidth="3" />
          {[29, 135, 241, 347, 453].map((x) => (
            <path
              key={x}
              d={`M${x} 168h79v66h-79z`}
              fill="#c7ba85"
              stroke="#1b3433"
              strokeWidth="5"
            />
          ))}
          <path
            d="M565 161H630V295H565Z"
            fill="#142e2d"
            stroke="#72887b"
            strokeWidth="2"
          />
          <path
            d="M720 74V321M886 74V321M675 73H938"
            stroke="#253b37"
            strokeWidth="8"
          />
          <path d="M672 73L766 26H960V73Z" fill="#2a4039" />
          <path
            d="M21 382H940M0 427H960"
            stroke="#879381"
            strokeOpacity=".3"
            strokeWidth="2"
          />
        </>
      )}
      <ellipse
        cx="570"
        cy="375"
        rx="310"
        ry="22"
        fill="#071612"
        fillOpacity=".26"
      />
    </svg>
  );
}
