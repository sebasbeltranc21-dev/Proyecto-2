"use client";
import Link from "next/link";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Copy,
  MessagesSquare,
  Send,
  Users,
  Wifi,
  WifiOff,
  Trophy,
  FileSearch,
  ShieldCheck,
} from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { act } from "@/lib/api";
import type { Action } from "@/lib/validation";
import type { RoomSnapshot } from "@/lib/types";
import { Avatar, ErrorNotice, Skeleton } from "./ui";
import { SuspectPortrait } from "./case-art";
import { CaseScene } from "./case-scene";
import { EvidenceWorkspace, TimelineBoard } from "./evidence-workspace";
export function GameRoom({ code, uid }: { code: string; uid: string }) {
  const [data, setData] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState("connecting");
  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"evidence" | "suspects" | "timeline">(
    "evidence",
  );
  const [selection, setSelection] = useState("");
  const [confirm, setConfirm] = useState(false);
  const offset = useRef(0);
  const fetching = useRef(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const { data, error } = await browserClient().rpc("mm_snapshot", {
        code,
      });
      if (error) throw error;
      offset.current = Date.parse(data.server_now) - Date.now();
      setData(data as RoomSnapshot);
      setNow(Date.now() + offset.current);
    } catch (e) {
      setError(
        (e as Error).message?.startsWith("MM:")
          ? (e as Error).message.slice(3)
          : "No se pudo sincronizar la sala. Comprueba tu conexión o vuelve al panel para unirte.",
      );
    } finally {
      fetching.current = false;
    }
  }, [code]);
  useEffect(() => {
    let active = true;
    async function heartbeat() {
      try {
        await act({ action: "tick", code });
        if (active) {
          setError("");
          await load();
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    }
    void heartbeat();
    const timer = setInterval(() => setNow(Date.now() + offset.current), 1000);
    const poll = setInterval(() => void heartbeat(), 5000);
    const online = () => void heartbeat();
    window.addEventListener("online", online);
    document.addEventListener("visibilitychange", online);
    return () => {
      active = false;
      clearInterval(timer);
      clearInterval(poll);
      window.removeEventListener("online", online);
      document.removeEventListener("visibilitychange", online);
    };
  }, [code, load]);
  const rid = data?.room.id;
  useEffect(() => {
    if (!rid) return;
    const client = browserClient();
    let active = true;
    let channel = client.channel(`room:${rid}`);
    for (const table of [
      "mm_rooms",
      "mm_participants",
      "mm_games",
      "mm_messages",
      "mm_evidence",
      "mm_results",
      "mm_timeline",
    ])
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `${table === "mm_rooms" ? "id" : "room_id"}=eq.${rid}`,
        },
        () => void load(),
      );
    channel.subscribe((status) => {
      if (!active) return;
      setConnection(
        status === "SUBSCRIBED"
          ? "live"
          : status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT" ||
              status === "CLOSED"
            ? "polling"
            : "connecting",
      );
      if (status === "SUBSCRIBED") void load();
    });
    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [rid, load]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest" });
  }, [data?.messages.length]);
  async function send(action: Action) {
    setBusy(true);
    setError("");
    try {
      await act(action);
      await load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(`Copia este código manualmente: ${code}`);
    }
  }
  async function chat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = String(new FormData(form).get("text")).trim();
    if (!text) return;
    if (await send({ action: "chat", code, text })) form.reset();
  }
  if (!data)
    return (
      <>
        <Link href="/panel" className="back">
          <ArrowLeft size={16} />
          Volver al panel
        </Link>
        {error ? (
          <>
            <ErrorNotice message={error} />
            <button className="button secondary" onClick={load}>
              Reintentar
            </button>
          </>
        ) : (
          <Skeleton />
        )}
      </>
    );
  const me = data.participants.find((p) => p.user_id === uid);
  const host = data.room.host_id === uid;
  const game = data.game;
  const stage = game?.stage ?? 0;
  const finished = stage === 3;
  const lobby = !game;
  const online = (time: string) => now - Date.parse(time) < 45000;
  const hostOnline = online(
    data.participants.find((p) => p.user_id === data.room.host_id)?.last_seen ||
      "1970-01-01",
  );
  const activePlayers = data.participants.filter((p) => online(p.last_seen));
  const canStart =
    activePlayers.length >= 2 && activePlayers.every((p) => p.ready);
  const secs = game
    ? Math.max(0, Math.ceil((Date.parse(game.phase_ends_at) - now) / 1000))
    : 0;
  const time = `${Math.floor(secs / 60)
    .toString()
    .padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;
  const solved = data.suspects.find((s) => s.id === data.solution?.suspect_id);
  return (
    <>
      <Link href="/panel" className="back">
        <ArrowLeft size={16} />
        Mi expediente
      </Link>
      <div className="room-top">
        <div>
          <p className="eyebrow">
            EXPEDIENTE {data.case.theme === "train" ? "002" : "001"} /
            COOPERATIVO
          </p>
          <h1>{data.case.title}</h1>
        </div>
        <div className="room-code">
          <span>CÓDIGO DE SALA</span>
          <button onClick={copy} aria-label="Copiar código de sala">
            <b>{code}</b>
            {copied ? <Check size={17} /> : <Copy size={17} />}
          </button>
        </div>
      </div>
      <div className="status-bar">
        <span className={`connection ${connection === "live" ? "live" : ""}`}>
          {connection === "live" ? <Wifi size={15} /> : <WifiOff size={15} />}{" "}
          {connection === "live"
            ? "Tiempo real conectado"
            : connection === "connecting"
              ? "Conectando tiempo real…"
              : "Tiempo real interrumpido · consultas cada 5 s"}
        </span>
        <span>
          <Users size={15} />
          {data.participants.filter((p) => online(p.last_seen)).length}/
          {data.participants.length} conectados
        </span>
        {!lobby && !finished && (
          <span className={secs < 30 ? "gold" : ""}>
            <Clock3 size={16} />
            {data.case.stages[stage].title} <b className="mono">{time}</b>
          </span>
        )}
        {finished && (
          <span>
            <ShieldCheck size={16} />
            Expediente cerrado
          </span>
        )}
      </div>
      {error && <ErrorNotice message={error} />}
      <div className="room-layout">
        <div className="investigation-column">
          {lobby ? (
            <section className="panel lobby-story">
              <div className="scene-small">
                <CaseScene theme={data.case.theme} />
                <span className="eyebrow">ANTES DE ENTRAR EN LA ESCENA</span>
              </div>
              <div className="lobby-content">
                <p className="eyebrow">BRIEFING DEL CASO</p>
                <h2>
                  {data.case.theme === "train" ? (
                    <>
                      El tren se detuvo.
                      <br />
                      Alguien lo planeó.
                    </>
                  ) : (
                    <>
                      La luz volvió.
                      <br />
                      La joya ya no estaba.
                    </>
                  )}
                </h2>
                <p>{data.case.intro}</p>
                <div className="case-lineup" aria-label="Personas de interés">
                  {data.suspects.map((s) => (
                    <figure key={s.id}>
                      <SuspectPortrait id={s.id} portrait={s.portrait} />
                      <figcaption>{s.name}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="rule-grid">
                  <div>
                    <Clock3 size={18} />
                    <b>{data.room.minutes} min</b>
                    <span>por fase de investigación</span>
                  </div>
                  <div>
                    <FileSearch size={18} />
                    <b>Pistas privadas</b>
                    <span>compartid vuestros hallazgos</span>
                  </div>
                  <div>
                    <ShieldCheck size={18} />
                    <b>Un solo voto</b>
                    <span>la mayoría decide</span>
                  </div>
                </div>
                <p className="muted">
                  Habrá dos fases de investigación y {data.room.vote_minutes}{" "}
                  minuto(s) de votación. Los votos son definitivos. Un empate o
                  no votar puede dejar el caso sin resolver.
                </p>
                {me && (
                  <button
                    className={`button ${me.ready ? "secondary" : "primary"}`}
                    disabled={busy}
                    onClick={() =>
                      void send({ action: "ready", code, ready: !me.ready })
                    }
                  >
                    <Check size={17} />
                    {me.ready
                      ? "Estoy listo · cambiar"
                      : "Estoy listo para investigar"}
                  </button>
                )}
                {host && (
                  <div className="start-area">
                    <button
                      className="button primary"
                      disabled={busy || !canStart}
                      onClick={() => void send({ action: "start", code })}
                    >
                      Iniciar investigación
                      <ArrowRight size={18} />
                    </button>
                    <small className="muted">
                      Se requieren al menos dos jugadores conectados y todos
                      listos.
                    </small>
                  </div>
                )}
              </div>
            </section>
          ) : finished ? (
            <section className="panel results-panel">
              <Trophy className="gold" size={40} />
              <p className="eyebrow">LA VERDAD SALE A LA LUZ</p>
              <h2>
                {game.success ? "Caso resuelto." : "El caso os ha sorprendido."}
              </h2>
              <p>
                {game.team_suspect
                  ? `El equipo acusó a ${data.suspects.find((s) => s.id === game.team_suspect)?.name}.`
                  : "No hubo una acusación única del equipo: empate o ausencia de votos."}
              </p>
              <div className="solution">
                {solved && (
                  <SuspectPortrait id={solved.id} portrait={solved.portrait} />
                )}
                <span className="eyebrow">RESPONSABLE DEL CASO</span>
                <h3>{solved?.name}</h3>
                <p>{data.solution?.explanation}</p>
              </div>
              <h3>Resultados del equipo</h3>
              <ul className="data-list">
                {data.results.map((r) => (
                  <li className="result-row" key={r.user_id}>
                    <span>
                      {r.name}
                      {r.user_id === uid ? " (tú)" : ""}
                      <small className="muted">
                        {r.correct
                          ? "Acusación correcta"
                          : "Acusación incorrecta o sin voto"}
                      </small>
                    </span>
                    <b className="gold">{r.points} pts</b>
                  </li>
                ))}
              </ul>
              <p className="muted">
                100 puntos por acertar tu voto + 50 para cada integrante si el
                equipo resuelve el caso. La puntuación se registra una sola vez.
              </p>
              <Link href="/panel" className="button primary">
                Volver al panel
                <ArrowRight size={17} />
              </Link>
            </section>
          ) : (
            <>
              <section className="panel story-panel">
                <div className="story-scene">
                  <CaseScene theme={data.case.theme} />
                </div>
                <div className="phase-track" aria-label="Fases de la partida">
                  {data.case.stages.slice(0, 3).map((s, i) => (
                    <span
                      key={s.title}
                      className={
                        i === stage ? "current" : i < stage ? "done" : ""
                      }
                    >
                      {i < stage ? <Check size={13} /> : <b>0{i + 1}</b>}
                      {s.title}
                    </span>
                  ))}
                </div>
                <p className="eyebrow">FASE 0{stage + 1}</p>
                <h2>{data.case.stages[stage].title}</h2>
                <p>{data.case.stages[stage].story}</p>
                {stage === 2 && (
                  <p className="gold">
                    {data.vote_count} de{" "}
                    {data.participants.filter((p) => p.in_game).length} votos
                    registrados. Tu voto no se puede cambiar.
                  </p>
                )}
              </section>
              <div className="tabs" role="tablist" aria-label="Expediente">
                <button
                  role="tab"
                  id="tab-evidence"
                  aria-controls="evidence-panel"
                  aria-selected={tab === "evidence"}
                  onClick={() => setTab("evidence")}
                >
                  Evidencias <span>{data.evidence.length}</span>
                </button>
                <button
                  role="tab"
                  id="tab-suspects"
                  aria-controls="suspects-panel"
                  aria-selected={tab === "suspects"}
                  onClick={() => setTab("suspects")}
                >
                  Sospechosos <span>{data.suspects.length}</span>
                </button>
                <button
                  role="tab"
                  id="tab-timeline"
                  aria-controls="timeline-panel"
                  aria-selected={tab === "timeline"}
                  onClick={() => setTab("timeline")}
                >
                  Cronología <span>{data.timeline?.length ?? 0}</span>
                </button>
              </div>
              {tab !== "suspects" ? (
                <section
                  role="tabpanel"
                  id={tab === "timeline" ? "timeline-panel" : "evidence-panel"}
                  aria-labelledby={
                    tab === "timeline" ? "tab-timeline" : "tab-evidence"
                  }
                >
                  <EvidenceWorkspace
                    data={data}
                    uid={uid}
                    mode={tab}
                    busy={busy}
                    error={error}
                    onAction={send}
                    onTimeline={() => setTab("timeline")}
                  />
                </section>
              ) : (
                <section
                  role="tabpanel"
                  id="suspects-panel"
                  aria-labelledby="tab-suspects"
                  className="suspect-grid"
                >
                  {data.suspects.map((s, i) => (
                    <article
                      className={`panel suspect ${data.my_vote === s.id ? "voted" : ""}`}
                      key={s.id}
                    >
                      <SuspectPortrait id={s.id} portrait={s.portrait} />
                      <div className="suspect-heading">
                        <span className="suspect-number">0{i + 1}</span>
                        <div>
                          <h3>{s.name}</h3>
                          <p className="muted">{s.description}</p>
                        </div>
                      </div>
                      <dl>
                        <dt>POSIBLE MOTIVO</dt>
                        <dd>{s.motive}</dd>
                        <dt>COARTADA</dt>
                        <dd>{s.alibi}</dd>
                      </dl>
                      {stage === 2 && (
                        <button
                          className={`button ${data.my_vote === s.id ? "primary" : "secondary"} full`}
                          disabled={
                            busy || Boolean(data.my_vote) || !me?.in_game
                          }
                          onClick={() => {
                            setSelection(s.id);
                            setConfirm(true);
                          }}
                        >
                          {data.my_vote === s.id ? (
                            <>
                              <Check size={16} />
                              Tu voto registrado
                            </>
                          ) : (
                            "Acusar a " + s.name.split(" ")[0]
                          )}
                        </button>
                      )}
                    </article>
                  ))}
                </section>
              )}
              {stage === 2 && tab === "evidence" && (
                <button
                  className="button primary vote-shortcut"
                  onClick={() => setTab("suspects")}
                >
                  Ir a la votación
                  <ArrowRight size={17} />
                </button>
              )}
            </>
          )}
          {finished && (
            <details className="panel final-evidence">
              <summary>Consultar las evidencias de tu expediente</summary>
              <EvidenceWorkspace
                data={data}
                uid={uid}
                mode="evidence"
                busy={busy}
                error={error}
                onAction={send}
                onTimeline={() => setTab("timeline")}
              />
            </details>
          )}
          {finished && (
            <details className="panel final-timeline">
              <summary>Consultar la cronología del equipo</summary>
              <TimelineBoard entries={data.timeline ?? []} uid={uid} />
            </details>
          )}
        </div>
        <aside className="room-sidebar">
          <section className="panel team-panel">
            <h2>
              <Users size={18} />
              El equipo{" "}
              <span className="muted">{data.participants.length}/8</span>
            </h2>
            <ul className="team-list">
              {data.participants.map((p) => (
                <li key={p.user_id}>
                  <Avatar small kind={p.avatar} />
                  <div>
                    <b>
                      {p.name}
                      {p.user_id === uid ? " (tú)" : ""}
                    </b>
                    <small>
                      {p.user_id === data.room.host_id
                        ? "Anfitrión"
                        : game && !p.in_game
                          ? "Observador"
                          : "Investigador"}
                      {!online(p.last_seen) ? " · Sin conexión" : ""}
                    </small>
                  </div>
                  <span
                    className={`player-state ${online(p.last_seen) ? "online" : ""}`}
                    aria-label={
                      online(p.last_seen) ? "Conectado" : "Desconectado"
                    }
                  >
                    {lobby && p.ready ? <Check size={14} /> : null}
                  </span>
                </li>
              ))}
            </ul>
            {!host && !hostOnline && (
              <button
                className="button secondary full"
                disabled={busy}
                onClick={() => void send({ action: "claim", code })}
              >
                Tomar el relevo de anfitrión
              </button>
            )}
            <p className="muted tiny">
              La identidad y el estado se conservan al reconectar con la misma
              sesión.
            </p>
          </section>
          <section className="panel chat-panel">
            <h2>
              <MessagesSquare size={18} />
              Teorías del equipo
            </h2>
            <div
              className="chat-messages"
              role="log"
              aria-label="Mensajes de la sala"
              aria-live="polite"
            >
              {data.messages.length === 0 ? (
                <p className="empty">
                  Las mejores teorías empiezan con una pregunta. Comparte la
                  tuya.
                </p>
              ) : (
                data.messages.map((m) => (
                  <article
                    key={m.id}
                    className={m.user_id === uid ? "mine" : ""}
                  >
                    <div>
                      <b>{m.name}</b>
                      <time dateTime={m.sent_at}>
                        {new Date(m.sent_at).toLocaleTimeString("es-EC", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <p>{m.body}</p>
                  </article>
                ))
              )}
              <div ref={chatEnd} />
            </div>
            <form onSubmit={chat}>
              <label className="sr-only" htmlFor="chat-text">
                Tu teoría
              </label>
              <textarea
                id="chat-text"
                name="text"
                maxLength={500}
                required
                rows={2}
                disabled={finished}
                placeholder={
                  finished
                    ? "El chat está cerrado."
                    : "Comparte una pista o teoría…"
                }
              />
              <div className="chat-send">
                <small>Hasta 500 caracteres</small>
                <button
                  className="button primary"
                  disabled={busy || finished}
                  aria-label="Enviar teoría"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </section>
        </aside>
      </div>
      {confirm && (
        <VoteDialog
          name={data.suspects.find((s) => s.id === selection)?.name || ""}
          busy={busy}
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (await send({ action: "vote", code, suspect: selection }))
              setConfirm(false);
          }}
        />
      )}
    </>
  );
}

function VoteDialog({
  name,
  busy,
  onClose,
  onConfirm,
}: {
  name: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="panel modal"
      aria-labelledby="confirm-title"
      onCancel={onClose}
    >
      <p className="eyebrow">ACUSACIÓN DEFINITIVA</p>
      <h2 id="confirm-title">¿Acusar a {name}?</h2>
      <p>Solo puedes emitir un voto. Esta decisión no se podrá modificar.</p>
      <div className="actions">
        <button
          autoFocus
          className="button secondary"
          disabled={busy}
          onClick={onClose}
        >
          Seguir revisando
        </button>
        <button
          className="button primary"
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          Confirmar voto
        </button>
      </div>
    </dialog>
  );
}
