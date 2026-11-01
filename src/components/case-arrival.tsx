"use client";
import { useEffect, useRef, useId } from "react";
import type { CaseTheme } from "@/lib/case-presentation";
import { casePresentation } from "@/lib/case-presentation";
import { CaseScene } from "./case-scene";
export function CaseArrival({
  gameId,
  theme,
  title,
}: {
  gameId: string;
  theme: CaseTheme;
  title: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const key = `mm-arrival:${gameId}`;
  function remember() {
    try {
      sessionStorage.setItem(key, "seen");
    } catch {
      /* View still dismisses without storage. */
    }
  }
  function close() {
    remember();
    ref.current?.close();
  }
  useEffect(() => {
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* Storage is optional. */
    }
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(key, "seen");
      } catch {}
      dialog.close();
    }, 4000);
    return () => {
      window.clearTimeout(timer);
      dialog.close();
    };
  }, [key]);
  return (
    <dialog
      ref={ref}
      className={`case-arrival arrival-${theme}`}
      aria-labelledby={titleId}
      onCancel={remember}
    >
      <div className="arrival-cover" aria-hidden="true">
        <CaseScene theme={theme} />
      </div>
      <div className="arrival-copy">
        <p className="eyebrow">
          ABRIENDO EXPEDIENTE / {casePresentation[theme].number}
        </p>
        <h2 id={titleId}>{title}</h2>
        <p>La investigación ya está en marcha.</p>
        <button className="button primary" onClick={close} autoFocus>
          Entrar en la investigación
        </button>
      </div>
    </dialog>
  );
}
