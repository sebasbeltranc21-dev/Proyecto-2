"use client";
import { DomeCinematicScene } from "./dome-cinematic-scene";
import type { CaseTheme } from "@/lib/case-presentation";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
      cast={data.suspects}
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
  cast,
  won,
  accused,
  children,
}: {
  gameId: string;
  uid: string;
  theme: CaseTheme;
  title: string;
  responsible: Suspect;
  cast: Suspect[];
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
      cast={cast}
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
  theme: CaseTheme,
  won: boolean,
  responsible: string,
  accused?: string,
) {
  if (theme === "observatory")
    return won
      ? [
          {
            title: "Una noche vuelve a encenderse.",
            text: "Los cuatro sospechosos se reúnen bajo la cúpula. El equipo contrasta los accesos con el maletín recuperado.",
          },
          {
            title: "El expediente encaja.",
            text: `Las pruebas identifican a ${responsible} como responsable de retirar el disco estelar.`,
          },
          {
            title: "La terraza guarda la última respuesta.",
            text: `Los investigadores acompañan a ${responsible} mientras la dirección recibe el informe. El disco queda protegido.`,
          },
          {
            title: "Nácar recupera sus estrellas.",
            text: "El disco original regresa al planetario. La Noche de los Deseos puede comenzar y el expediente queda cerrado.",
          },
        ]
      : [
          {
            title: "Una noche espera su cielo.",
            text: "El equipo reúne a los sospechosos, pero su conclusión no resuelve la desaparición.",
          },
          {
            title: accused
              ? "La acusación no encaja."
              : "Faltó una conclusión común.",
            text: accused
              ? `El equipo señaló a ${accused}; las pruebas no respaldan esa acusación.`
              : "Un empate o la ausencia de votos dejó al equipo sin una acusación única.",
          },
          {
            title: "Una coartada merecía otra mirada.",
            text: "El expediente conserva los registros del banco de trabajo y el recorrido de los maletines para revisar las conexiones.",
          },
          {
            title: "La verdad bajo la cúpula.",
            text: `El informe oficial identifica a ${responsible} y explica cómo retiró y ocultó el disco. Puedes revisar todas las pruebas en los resultados.`,
          },
        ];
  if (theme === "lighthouse")
    return won
      ? [
          {
            title: "La tormenta pierde su ventaja.",
            text: "El equipo reúne los registros del Faro Bruma y reconstruye la hora real de la desaparición.",
          },
          {
            title: "Las pruebas señalan un nombre.",
            text: `El sensor, los accesos y el embalaje identifican a ${responsible} como responsable de retirar Aurora.`,
          },
          {
            title: "El muelle queda cerrado.",
            text: `Los agentes interceptan a ${responsible} antes de que se autorice el embarque.`,
          },
          {
            title: "Aurora vuelve a su lugar.",
            text: `${responsible} queda bajo custodia. La lente se recupera intacta y la exhibición del faro puede continuar.`,
          },
        ]
      : [
          {
            title: "El faro espera una respuesta.",
            text: "El equipo entrega sus conclusiones, pero no logra conectar todas las pruebas.",
          },
          {
            title: accused
              ? "La acusación no encaja."
              : "Faltó una conclusión común.",
            text: accused
              ? `El equipo señaló a ${accused}; los registros no respaldan esa acusación.`
              : "El empate o la ausencia de votos dejó al equipo sin una acusación única.",
          },
          {
            title: "Una hora cambió la historia.",
            text: "El momento del hallazgo no era necesariamente el momento de la retirada. El expediente permite revisar esa diferencia.",
          },
          {
            title: "La verdad de medianoche.",
            text: `El informe identifica a ${responsible} como responsable y reconstruye el recorrido de Aurora hasta el muelle.`,
          },
        ];
  if (theme === "theater")
    return won
      ? [
          {
            title: "El telón puede levantarse.",
            text: "El equipo reúne las pruebas junto al atril vacío del Teatro Bellavista.",
          },
          {
            title: "Las pruebas señalan un nombre.",
            text: `La investigación identifica a ${responsible} como responsable de ocultar la partitura.`,
          },
          {
            title: "Los agentes cierran el paso.",
            text: `Los agentes interceptan a ${responsible} a la salida de bastidores.`,
          },
          {
            title: "El expediente se cierra.",
            text: "La partitura vuelve a manos de la compositora. El estreno puede continuar.",
          },
        ]
      : [
          {
            title: "El teatro espera una respuesta.",
            text: "El equipo entrega sus conclusiones, pero no logra resolver el caso.",
          },
          {
            title: accused
              ? "La acusación no encaja."
              : "Faltó una conclusión común.",
            text: accused
              ? `El equipo señaló a ${accused}; las pruebas no respaldan esa acusación.`
              : "El empate o la ausencia de votos impidió una acusación única.",
          },
          {
            title: "Una pieza quedó fuera de lugar.",
            text: "El expediente conserva las pistas para revisar qué conexión faltó.",
          },
          {
            title: "La verdad del último acto.",
            text: `El informe revela a ${responsible} como responsable y explica el recorrido de la partitura.`,
          },
        ];
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
  cast,
  won,
  accused,
  onFinish,
}: {
  theme: CaseTheme;
  title: string;
  responsible: Suspect;
  cast: Suspect[];
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
  useLayoutEffect(() => {
    // Instant positioning happens before paint and before the first scene timer.
    heading.current
      ?.closest<HTMLElement>(".ending-player")
      ?.scrollIntoView?.({ block: "start", behavior: "instant" });
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
        <DomeCinematicScene
          frame={frame}
          won={won}
          theme={theme}
          cast={cast}
          name={responsible.name}
          portrait={responsible.portrait}
        />
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
