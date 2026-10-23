"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Plus,
  LogOut,
  Trophy,
  FolderOpen,
  Check,
  Save,
  Fingerprint,
  Paperclip,
  Files,
  KeyRound,
  BadgeCheck,
} from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { act } from "@/lib/api";
import type { HomeSnapshot } from "@/lib/types";
import { actionSchema, roomCode } from "@/lib/validation";
import { Avatar, ErrorNotice, Skeleton, avatarIcons } from "./ui";
import { DeskIllustration } from "./office-art";
export function Dashboard({
  anonymous,
  initialData,
  initialError,
}: {
  anonymous: boolean;
  initialData: HomeSnapshot | null;
  initialError: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<HomeSnapshot | null>(initialData);
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(initialData?.profile?.name || "");
  const [joinError, setJoinError] = useState("");
  const [avatar, setAvatar] = useState(initialData?.profile?.avatar || "lupa");
  const [caseSlug, setCaseSlug] = useState(
    initialData?.cases?.find((c) => c.slug === "ultima-luz")?.slug ||
      initialData?.cases?.[0]?.slug ||
      "",
  );
  async function load() {
    try {
      const { data, error } = await browserClient().rpc("mm_home");
      if (error) throw error;
      setData(data as HomeSnapshot);
      setAvatar(data.profile?.avatar || "lupa");
      setName(data.profile?.name || "");
      setCaseSlug((current) =>
        data.cases?.some((c: { slug: string }) => c.slug === current)
          ? current
          : data.cases?.[0]?.slug || "",
      );
      setError("");
    } catch {
      setError(
        "No se pudo cargar tu expediente. Comprueba la conexión y que las migraciones estén aplicadas.",
      );
    }
  }
  async function profile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setSaved(false);
    try {
      await act({
        action: "profile",
        name: String(f.get("name")),
        avatar: avatar as "lupa",
      });
      await load();
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const result = await act({
        action: "create",
        minutes: Number(f.get("minutes")),
        voteMinutes: Number(f.get("voteMinutes")),
        allowGuests: f.get("guests") === "on",
        caseSlug: String(f.get("caseSlug")),
      });
      router.push(`/sala/${result.code}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  async function join(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setJoinError("");
    setBusy(true);
    try {
      const parsedCode = roomCode.safeParse(String(form.get("code")));
      if (!parsedCode.success)
        throw new Error("Escribe el código de invitación de 8 caracteres.");
      if (!data?.profile) {
        const parsedProfile = actionSchema.safeParse({
          action: "profile",
          name,
          avatar,
        });
        if (!parsedProfile.success)
          throw new Error(
            "Escribe un nombre de entre 2 y 24 caracteres para entrar.",
          );
        await act(parsedProfile.data);
        await load();
      }
      const result = await act({ action: "join", code: parsedCode.data });
      router.push(`/sala/${result.code}`);
    } catch (e) {
      setJoinError((e as Error).message);
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const { error } = await browserClient().auth.signOut();
      if (error) throw error;
      router.replace("/");
      router.refresh();
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading desk-heading">
        <div>
          <p className="eyebrow">
            <Fingerprint size={15} aria-hidden="true" /> ARCHIVO CENTRAL / MODO
            MISTERIO
          </p>
          <h1>Tu mesa de investigación.</h1>
        </div>
        <button className="button quiet" onClick={logout} disabled={busy}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
      <section className="office-welcome" aria-label="Central de investigación">
        <div className="office-welcome-copy">
          <span className="office-label">
            DEPARTAMENTO DE CASOS SIN RESOLVER
          </span>
          <h2>
            El siguiente misterio
            <br />
            empieza <em>en tu escritorio.</em>
          </h2>
          <p>
            Abre un expediente, reúne a tu equipo y sigue el rastro. La verdad
            está en los detalles.
          </p>
          {data && (
            <nav
              className="office-shortcuts"
              aria-label="Accesos del escritorio"
            >
              <a href="#abrir-expediente">
                <FolderOpen size={16} aria-hidden="true" /> Elegir caso{" "}
                <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a href="#unirse">
                <KeyRound size={16} aria-hidden="true" /> Tengo un código
              </a>
            </nav>
          )}
        </div>
        <DeskIllustration />
      </section>
      {anonymous && (
        <p className="notice">
          Has entrado como invitado. Conserva esta sesión para regresar a tus
          partidas.
        </p>
      )}
      {error && (
        <>
          <ErrorNotice message={error} />
          <button className="text-link" onClick={load}>
            Reintentar conexión
          </button>
        </>
      )}
      {!data && !error && <Skeleton />}
      {data && (
        <>
          <div className="dashboard-grid office-grid">
            <section
              className="panel create-panel folder-catalog"
              id="abrir-expediente"
            >
              <p className="eyebrow">MESA DE ENTRADA / CASOS</p>
              <div className="catalog-heading">
                <h2>Crea una sala privada</h2>
                <Files size={23} aria-hidden="true" />
              </div>
              <p className="muted">
                {data.cases?.length ?? 0} expedientes disponibles · 2–8 personas
              </p>
              <form onSubmit={create}>
                <fieldset className="case-picker">
                  <legend>Elige el caso</legend>
                  <div className="case-options">
                    {(data.cases ?? []).map((c) => (
                      <label
                        className={`case-option ${caseSlug === c.slug ? "selected" : ""}`}
                        key={c.slug}
                      >
                        <input
                          type="radio"
                          name="caseSlug"
                          value={c.slug}
                          checked={caseSlug === c.slug}
                          onChange={() => setCaseSlug(c.slug)}
                          required
                        />
                        <span className="folder-tab" aria-hidden="true">
                          CASO {c.theme === "train" ? "002" : "001"}
                        </span>
                        <span className="folder-photo">
                          <Image
                            unoptimized
                            src={
                              c.theme === "train" ? "/train.svg" : "/museum.svg"
                            }
                            alt=""
                            width={420}
                            height={240}
                          />
                          <Paperclip
                            size={22}
                            className="folder-clip"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="folder-copy">
                          <b>{c.title}</b>
                          <small>
                            {c.suspect_count} sospechosos · Cooperativo
                          </small>
                          <span className="folder-selection">
                            <span
                              className="folder-selection-dot"
                              aria-hidden="true"
                            />
                            {caseSlug === c.slug
                              ? "Seleccionado"
                              : "Elegir expediente"}
                          </span>
                        </span>
                        {caseSlug === c.slug && (
                          <Check size={17} aria-hidden="true" />
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {caseSlug && (
                  <p className="case-brief">
                    {data.cases?.find((c) => c.slug === caseSlug)?.intro}
                  </p>
                )}
                {!data.cases?.length && (
                  <p className="notice">
                    El catálogo de casos no está disponible. Reintenta la
                    conexión y comprueba las migraciones.
                  </p>
                )}
                <div className="form-row">
                  <label>
                    Minutos por investigación
                    <select name="minutes" defaultValue="5">
                      {[1, 3, 5, 8, 10, 15].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Minutos para votar
                    <select name="voteMinutes" defaultValue="2">
                      {[1, 2, 3, 5].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="guests"
                    defaultChecked={anonymous}
                    disabled={
                      process.env.NEXT_PUBLIC_ALLOW_GUESTS !== "true" &&
                      !anonymous
                    }
                  />
                  Permitir invitados
                </label>
                <button
                  className="button primary"
                  disabled={busy || !data.profile || !caseSlug}
                >
                  <Plus size={17} />
                  Crear sala
                </button>
                {!data.profile && (
                  <small className="muted">
                    <a href="#perfil-investigador" className="text-link">
                      Guarda tu perfil para crear una sala.
                    </a>
                  </small>
                )}
              </form>
            </section>
            <div className="office-sidebar">
              <section
                className="panel credential-panel"
                id="perfil-investigador"
              >
                <p className="eyebrow">ARCHIVO PERSONAL / IDENTIFICACIÓN</p>
                <h2>Tu perfil de investigador</h2>
                <div className="investigator-credential">
                  <Avatar kind={data.profile?.avatar || avatar} />
                  <div>
                    <span>CREDENCIAL DE INVESTIGACIÓN</span>
                    <b>{data.profile?.name || "Pendiente de identificación"}</b>
                    <small>
                      {data.profile
                        ? "Perfil guardado"
                        : "Completa tu nombre y emblema"}
                    </small>
                  </div>
                  <BadgeCheck size={25} aria-hidden="true" />
                </div>
                <form onSubmit={profile}>
                  <label>
                    Nombre visible
                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={24}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="¿Cómo te llama tu equipo?"
                    />
                  </label>
                  <fieldset>
                    <legend>Elige tu emblema</legend>
                    <div className="avatars">
                      {Object.keys(avatarIcons).map((kind) => (
                        <button
                          type="button"
                          aria-label={`Emblema ${kind}`}
                          aria-pressed={avatar === kind}
                          onClick={() => setAvatar(kind)}
                          key={kind}
                        >
                          <Avatar kind={kind} />
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <button className="button secondary" disabled={busy}>
                    <Save size={16} />
                    Guardar perfil
                  </button>
                  {saved && (
                    <span className="saved" role="status">
                      <Check size={14} />
                      Guardado
                    </span>
                  )}
                </form>
              </section>
              <section className="panel join-panel" id="unirse">
                <p className="eyebrow">ACCESO POR INVITACIÓN</p>
                <h2>¿Te han enviado un código?</h2>
                <form
                  onSubmit={join}
                  className="join-form"
                  aria-label="Unirse a una sala"
                >
                  <div
                    className={`join-fields ${!data.profile ? "needs-profile" : ""}`}
                  >
                    {!data.profile && (
                      <label key="name">
                        Nombre para entrar
                        <input
                          name="join-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          minLength={2}
                          maxLength={24}
                          placeholder="Tu nombre de investigador"
                          autoComplete="nickname"
                          aria-describedby="join-profile-help"
                        />
                      </label>
                    )}
                    <label key="code">
                      Código de invitación
                      <input
                        name="code"
                        className="code-input"
                        required
                        pattern="[A-Fa-f0-9]{8}"
                        minLength={8}
                        maxLength={8}
                        placeholder="A1B2C3D4"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </label>
                  </div>
                  <button className="button secondary" disabled={busy}>
                    Entrar a la sala
                    <ArrowRight size={17} />
                  </button>
                  {!data.profile && (
                    <p className="join-help muted" id="join-profile-help">
                      Escribe tu nombre y el código. Guardaremos tu perfil antes
                      de entrar a la sala.
                    </p>
                  )}
                  {joinError && <ErrorNotice message={joinError} />}
                </form>
              </section>
            </div>
          </div>
          <div className="stats-strip">
            <div>
              <b>{data.stats.games}</b>
              <span>Casos completados</span>
            </div>
            <div>
              <b>{data.stats.correct}</b>
              <span>Acusaciones correctas</span>
            </div>
            <div>
              <b>{data.stats.points}</b>
              <span>Puntos acumulados</span>
            </div>
          </div>
          <div className="archive-heading">
            <div>
              <p className="eyebrow">REGISTRO DE ACTIVIDAD</p>
              <h2>El archivo del investigador.</h2>
            </div>
            <Fingerprint size={36} aria-hidden="true" />
          </div>
          <div className="two-col">
            <section className="panel archive-panel" id="mis-expedientes">
              <h2>
                <FolderOpen size={20} />
                Tus expedientes
              </h2>
              {data.rooms.length === 0 ? (
                <p className="empty">
                  Todavía no tienes salas. Abre tu primer expediente.
                </p>
              ) : (
                <ul className="data-list">
                  {data.rooms.map((r) => (
                    <li key={r.code}>
                      <Link href={`/sala/${r.code}`}>
                        <b className="mono">{r.code}</b>
                        {r.title && (
                          <small className="recent-case-title">{r.title}</small>
                        )}
                        <span
                          className={`archive-status ${r.status === "active" ? "active" : r.status === "finished" ? "finished" : "waiting"}`}
                        >
                          {r.status === "lobby"
                            ? "En espera"
                            : r.status === "active"
                              ? "En curso"
                              : "Finalizada"}
                        </span>
                        <ArrowRight size={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="subheading">Historial de resultados</h3>
              {data.history.length === 0 ? (
                <p className="empty">
                  Tus resultados aparecerán al completar una partida.
                </p>
              ) : (
                <ul className="data-list">
                  {data.history.map((h) => (
                    <li key={h.code}>
                      <Link href={`/sala/${h.code}`}>
                        <span>
                          {h.title}
                          <small className="muted">
                            {new Date(h.finished_at).toLocaleDateString(
                              "es-EC",
                            )}
                          </small>
                        </span>
                        <b className="gold">{h.points} pts</b>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="panel leaderboard-panel">
              <h2>
                <Trophy size={20} />
                Clasificación
              </h2>
              <p className="muted">Investigadores con más puntos · Top 10</p>
              {data.leaderboard.length === 0 ? (
                <p className="empty">
                  El primer caso resuelto abrirá la clasificación.
                </p>
              ) : (
                <ol className="data-list rankings">
                  {data.leaderboard.map((p, i) => (
                    <li key={i}>
                      <span className="muted mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Avatar small kind={p.avatar} />
                      <span>
                        {p.name}
                        <small className="muted">{p.games} partidas</small>
                      </span>
                      <b className="gold">{p.points}</b>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
