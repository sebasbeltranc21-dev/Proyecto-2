"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  Clock3,
  FileSearch,
  LockKeyhole,
  MapPin,
  Maximize2,
  Pin,
  Trash2,
  TrainFront,
  X,
} from "lucide-react";
import type { Evidence, RoomSnapshot, TimelineEntry } from "@/lib/types";
import type { Action } from "@/lib/validation";
import { EvidenceIllustration } from "./case-art";
import { ErrorNotice } from "./ui";

function clock(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function TimelineBoard({
  entries,
  uid,
  editable = false,
  busy = false,
  onEdit,
  onRemove,
}: {
  entries: TimelineEntry[];
  uid: string;
  editable?: boolean;
  busy?: boolean;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="timeline-board">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">TABLERO DEL EQUIPO</p>
          <h3>Reconstruid aquella noche.</h3>
        </div>
        <Clock3 size={25} aria-hidden="true" />
      </div>
      <p className="workspace-help">
        Estas horas son hipótesis elegidas por los jugadores. El tablero no
        confirma la solución. Todos los integrantes pueden leer las pistas que
        se comparten aquí.
      </p>
      {entries.length === 0 ? (
        <div className="timeline-empty">
          <Pin size={30} aria-hidden="true" />
          <p>Aún no hay pistas en la cronología.</p>
          <small>
            Examina una evidencia, elige una hora y añádela al tablero.
          </small>
        </div>
      ) : (
        <ol className="timeline-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span className="timeline-time mono">{clock(entry.minute)}</span>
              <article className="panel timeline-card">
                <p className="timeline-author">
                  Hora propuesta por {entry.name}
                  {entry.user_id === uid ? " (tú)" : ""}
                  {entry.shared_private
                    ? " · Pista privada compartida"
                    : " · Pista pública"}
                </p>
                <h4>{entry.title}</h4>
                <details>
                  <summary>Leer evidencia compartida</summary>
                  <p>{entry.body}</p>
                </details>
                {editable && entry.user_id === uid && (
                  <div className="timeline-actions">
                    <button
                      className="text-link"
                      onClick={() => onEdit?.(entry.evidence_id)}
                      disabled={busy}
                    >
                      <Clock3 size={14} />
                      Cambiar hora
                    </button>
                    <button
                      className="text-link"
                      onClick={() => onRemove?.(entry.id)}
                      disabled={busy}
                    >
                      <Trash2 size={14} />
                      Retirar del tablero
                    </button>
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
      {!editable && entries.length > 0 && (
        <p className="muted tiny">
          La cronología queda como consulta durante la votación y después del
          cierre.
        </p>
      )}
    </div>
  );
}

export function EvidenceWorkspace({
  data,
  uid,
  mode,
  busy,
  error,
  onAction,
  onTimeline,
}: {
  data: RoomSnapshot;
  uid: string;
  mode: "evidence" | "timeline";
  busy: boolean;
  error: string;
  onAction: (action: Action) => Promise<boolean>;
  onTimeline: () => void;
}) {
  const [zone, setZone] = useState("");
  const [inspected, setInspected] = useState("");
  const stage = data.game?.stage ?? 0;
  const editable = Boolean(
    data.game &&
    stage < 2 &&
    data.participants.some((p) => p.user_id === uid && p.in_game),
  );
  const evidence = data.evidence.filter((e) => !zone || e.location_id === zone);
  const selected = data.evidence.find((e) => e.id === inspected);
  const referenceNumbers = new Map(
    data.evidence.map((e, i) => [e.id, String(i + 1).padStart(2, "0")]),
  );
  const entries = data.timeline ?? [];
  const locations = data.case.locations ?? [];
  const location = locations.find((l) => l.id === zone);
  return (
    <>
      {mode === "timeline" ? (
        <TimelineBoard
          entries={entries}
          uid={uid}
          editable={editable}
          busy={busy}
          onEdit={setInspected}
          onRemove={(entry) =>
            void onAction({
              action: "timeline_remove",
              code: data.room.code,
              entry,
            })
          }
        />
      ) : (
        <>
          <section
            className={`panel exploration-map ${data.case.theme === "train" ? "train-map" : "museum-map"}`}
            aria-label="Mapa de investigación"
          >
            <div className="workspace-heading">
              <div>
                <p className="eyebrow">EXPLORA EL ESCENARIO</p>
                <h3>
                  {data.case.theme === "train"
                    ? "Los vagones del expreso"
                    : "El plano del museo"}
                </h3>
              </div>
              {data.case.theme === "train" ? (
                <TrainFront size={26} aria-hidden="true" />
              ) : (
                <MapPin size={26} aria-hidden="true" />
              )}
            </div>
            <p className="workspace-help">
              Elige una zona para consultar tus pistas. Los recuentos solo
              incluyen la información que puedes ver.
            </p>
            <div className="map-locations">
              {locations.map((l, i) => {
                const locked = l.stage > stage;
                const count = data.evidence.filter(
                  (e) => e.location_id === l.id,
                ).length;
                return (
                  <button
                    key={l.id}
                    className={`map-location ${zone === l.id ? "selected" : ""}`}
                    disabled={locked}
                    aria-pressed={zone === l.id}
                    onClick={() => setZone(l.id)}
                  >
                    <span className="map-room-drawing" aria-hidden="true">
                      <b>{String(i + 1).padStart(2, "0")}</b>
                      <i />
                      <i />
                      {locked && <LockKeyhole size={16} />}
                    </span>
                    <b>{l.name}</b>
                    <small>
                      {locked
                        ? `Abre en fase ${l.stage + 1}`
                        : `${count} pista${count === 1 ? "" : "s"} para ti`}
                    </small>
                  </button>
                );
              })}
            </div>
            <div className="map-selection">
              <span>
                {location
                  ? location.description
                  : "Todo tu expediente, ordenado por fase."}
              </span>
              <button
                className="text-link"
                aria-pressed={!zone}
                onClick={() => setZone("")}
              >
                Ver todas las pistas
              </button>
            </div>
          </section>
          <div className="evidence-grid">
            {evidence.length === 0 ? (
              <p className="empty">
                {zone
                  ? "No tienes pistas disponibles en esta zona. Puedes explorar otra o consultar todo el expediente."
                  : "Aún no hay evidencias para esta fase."}
              </p>
            ) : (
              evidence.map((e) => (
                <article
                  key={e.id}
                  className={`evidence-card field-record ${e.user_id ? "private" : ""}`}
                  data-inspected={inspected === e.id}
                >
                  <span className="evidence-type">
                    {e.user_id ? (
                      <>
                        <LockKeyhole size={13} />
                        {entries.some((entry) => entry.evidence_id === e.id)
                          ? "PISTA PRIVADA · COMPARTIDA EN EL TABLERO"
                          : "SOLO TÚ PUEDES VERLA"}
                      </>
                    ) : (
                      <>
                        <FileSearch size={13} />
                        EVIDENCIA PÚBLICA
                      </>
                    )}
                  </span>
                  <div className="field-reference">
                    <span>INDICIO N.º {referenceNumbers.get(e.id)}</span>
                    <span>FASE {e.stage + 1}</span>
                  </div>
                  <figure className="field-photo">
                    <EvidenceIllustration title={e.title} />
                    <figcaption>
                      Registro ilustrado ·{" "}
                      {locations.find((l) => l.id === e.location_id)?.name ??
                        "Expediente"}
                    </figcaption>
                  </figure>
                  <h3>{e.title}</h3>
                  <p>{e.body}</p>
                  <button
                    className="examine-button"
                    onClick={() => setInspected(e.id)}
                    aria-label={`Examinar evidencia: ${e.title}`}
                    aria-haspopup="dialog"
                    aria-expanded={inspected === e.id}
                  >
                    <Maximize2 size={15} />
                    Examinar evidencia
                  </button>
                  {entries.some((entry) => entry.evidence_id === e.id) && (
                    <small>
                      <Pin size={12} />
                      Añadida a la cronología del equipo
                    </small>
                  )}
                </article>
              ))
            )}
          </div>
        </>
      )}
      {selected && (
        <EvidenceDialog
          key={selected.id}
          evidence={selected}
          reference={referenceNumbers.get(selected.id) ?? "—"}
          entry={entries.find((e) => e.evidence_id === selected.id)}
          uid={uid}
          editable={editable}
          busy={busy}
          error={error}
          onClose={() => setInspected("")}
          onPin={async (minute, sharePrivate) => {
            if (
              await onAction({
                action: "timeline_pin",
                code: data.room.code,
                evidence: selected.id,
                minute,
                sharePrivate,
              })
            ) {
              setInspected("");
              onTimeline();
            }
          }}
        />
      )}
    </>
  );
}

function EvidenceDialog({
  evidence,
  reference,
  entry,
  uid,
  editable,
  busy,
  error,
  onClose,
  onPin,
}: {
  evidence: Evidence;
  reference: string;
  entry?: TimelineEntry;
  uid: string;
  editable: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onPin: (minute: number, sharePrivate: boolean) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [time, setTime] = useState(entry ? clock(entry.minute) : "");
  const [share, setShare] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [localError, setLocalError] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  async function pin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setLocalError("Indica una hora válida en formato HH:mm.");
      return;
    }
    setLocalError("");
    setAttempted(true);
    const [hour, minute] = time.split(":").map(Number);
    await onPin(hour * 60 + minute, share);
  }
  return (
    <dialog
      ref={dialog}
      className="panel modal evidence-dialog"
      aria-labelledby={titleId}
      onCancel={onClose}
    >
      <button
        className="button quiet dialog-close"
        onClick={onClose}
        aria-label="Cerrar evidencia"
        autoFocus
      >
        <X size={20} />
      </button>
      <p className="eyebrow">
        {evidence.user_id ? "TU PISTA PRIVADA" : "EVIDENCIA PÚBLICA"} / VISTA
        AMPLIADA
      </p>
      <p className="field-dialog-reference">
        INDICIO N.º {reference} · FASE {evidence.stage + 1}
      </p>
      <h2 id={titleId}>{evidence.title}</h2>
      <figure className="field-photo field-photo-expanded">
        <EvidenceIllustration title={evidence.title} />
        <figcaption>Registro ilustrado del indicio {reference}</figcaption>
      </figure>
      <p className="expanded-evidence-body">{evidence.body}</p>
      {localError && <ErrorNotice message={localError} />}
      {attempted && error && <ErrorNotice message={error} />}
      {editable && (!entry || entry.user_id === uid) ? (
        <form onSubmit={pin} className="pin-evidence-form">
          <h3>
            <Pin size={17} />{" "}
            {entry ? "Ajustar la hora propuesta" : "Añadir a la cronología"}
          </h3>
          <p>
            Elige la hora que propone tu teoría. Se guardará para todo el
            equipo.
          </p>
          <label>
            Hora propuesta
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          {evidence.user_id && (
            <label className="checkbox private-share-confirm">
              <input
                type="checkbox"
                required
                checked={share}
                onChange={(e) => setShare(e.target.checked)}
              />
              <span>
                Quiero compartir el título y el texto completos de esta pista
                privada con todo el equipo.
              </span>
            </label>
          )}
          <button
            className="button primary full"
            disabled={busy || !time || Boolean(evidence.user_id && !share)}
          >
            <Pin size={16} />
            {entry ? "Guardar nueva hora" : "Compartir en la cronología"}
          </button>
        </form>
      ) : (
        <p className="muted tiny">
          {entry
            ? `Esta pista ya fue añadida por ${entry.name}.`
            : "Puedes examinar las evidencias; la cronología se edita durante la investigación."}
        </p>
      )}
    </dialog>
  );
}
