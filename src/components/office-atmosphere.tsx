"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Moon, Pause, Play } from "lucide-react";

const preferenceKey = "mm-office-atmosphere";
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToPreference(change: () => void) {
  const media = window.matchMedia(motionQuery);
  const storageChanged = (event: StorageEvent) => {
    if (event.key === preferenceKey || event.key === null) change();
  };
  media.addEventListener("change", change);
  window.addEventListener("storage", storageChanged);
  return () => {
    media.removeEventListener("change", change);
    window.removeEventListener("storage", storageChanged);
  };
}
function readPreference() {
  if (window.matchMedia(motionQuery).matches) return "reduced";
  try {
    if (localStorage.getItem(preferenceKey) === "paused") return "paused";
  } catch {
    /* The in-memory control remains available. */
  }
  return "playing";
}
const serverPreference = () => "pending";
const AtmosphereContext = createContext<{
  paused: boolean;
  reducedMotion: boolean;
  ready: boolean;
  toggle: () => void;
} | null>(null);

export function OfficeAtmosphere({ children }: { children: ReactNode }) {
  // Keep the server render still; start only after reading local preferences.
  const preference = useSyncExternalStore(
    subscribeToPreference,
    readPreference,
    serverPreference,
  );
  const [manualPause, setManualPause] = useState<boolean | null>(null);
  const paused = manualPause ?? preference !== "playing";
  const reducedMotion = preference === "reduced";
  const ready = preference !== "pending";

  function toggle() {
    const next = !paused;
    setManualPause(next);
    try {
      localStorage.setItem(preferenceKey, next ? "paused" : "playing");
    } catch {
      /* Motion control still works when storage is unavailable. */
    }
  }

  return (
    <AtmosphereContext.Provider
      value={{ paused, reducedMotion, ready, toggle }}
    >
      <div
        className="office-atmosphere"
        aria-hidden="true"
        data-paused={paused || reducedMotion || !ready}
      >
        <div className="office-night-haze" />
        <div className="office-window">
          <div className="office-city-lights">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="office-rain">
            {Array.from({ length: 20 }, (_, index) => (
              <i
                key={index}
                style={
                  {
                    "--rain-left": `${(index * 37 + 7) % 100}%`,
                    "--rain-delay": `${-index * 0.47}s`,
                    "--rain-duration": `${1.6 + (index % 5) * 0.23}s`,
                    "--rain-length": `${18 + (index % 4) * 9}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="office-window-frame" />
        </div>
        <div className="office-blind-shadows" />
        <div className="office-lamp-light" />
        <div className="office-lamp-fixture">
          <span className="lamp-neck" />
          <span className="lamp-base" />
          <span className="lamp-shade" />
        </div>
        <div className="office-dust">
          {Array.from({ length: 6 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  "--mote-left": `${9 + index * 6}%`,
                  "--mote-top": `${62 + (index % 3) * 8}%`,
                  "--mote-delay": `${-index * 3}s`,
                  "--mote-duration": `${18 + index * 2}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
      {children}
    </AtmosphereContext.Provider>
  );
}

export function AtmosphereControl() {
  const atmosphere = useContext(AtmosphereContext);
  if (!atmosphere) return null;
  if (atmosphere.reducedMotion)
    return (
      <span
        className="atmosphere-control static"
        title="Tu dispositivo tiene activada la opción de reducir movimiento."
      >
        <Moon size={14} aria-hidden="true" /> Ambiente estático
      </span>
    );
  return (
    <button
      className="atmosphere-control"
      type="button"
      onClick={atmosphere.toggle}
      disabled={!atmosphere.ready}
      aria-pressed={!atmosphere.paused}
    >
      {atmosphere.paused ? (
        <Play size={13} aria-hidden="true" />
      ) : (
        <Pause size={13} aria-hidden="true" />
      )}
      {!atmosphere.ready
        ? "Ambiente nocturno"
        : atmosphere.paused
          ? "Activar ambiente"
          : "Pausar ambiente"}
    </button>
  );
}
