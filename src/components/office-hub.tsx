"use client";
import Image from "next/image";
import {
  Phone,
  Archive,
  Fingerprint,
  ArrowUpRight,
  FolderOpen,
} from "lucide-react";
import type { HomeSnapshot } from "@/lib/types";
import { characterFor } from "@/lib/characters";
import { casePresentation } from "@/lib/case-presentation";
import { DeskIllustration } from "./office-art";
export function OfficeHub({
  data,
  selected,
  onSelect,
}: {
  data: HomeSnapshot;
  selected: string;
  onSelect: (slug: string) => void;
}) {
  const character = characterFor(data.profile?.avatar ?? "lupa");
  return (
    <section className="office-hub" aria-label="Tu oficina de investigación">
      <div className="hub-room" aria-hidden="true">
        <div className="hub-window">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="hub-wall-frame">
          OBSERVAR
          <br />
          CONTRASTAR
          <br />
          DEDUCIR
        </div>
        <div className="hub-lamplight" />
      </div>
      <header className="hub-heading">
        <p className="eyebrow">CENTRAL DE INVESTIGACIÓN / TU OFICINA</p>
        <h2>
          La noche guarda
          <br />
          <em>otro misterio.</em>
        </h2>
        <p>
          {data.profile
            ? `Bienvenido, ${data.profile.name}.`
            : "Tu próxima investigación empieza aquí."}{" "}
          Elige un expediente de la mesa.
        </p>
      </header>
      <div className="hub-detective" aria-hidden="true">
        <Image src={character.image} alt="" width={240} height={320} />
      </div>
      <div className="hub-desk" aria-hidden="true">
        <DeskIllustration />
      </div>
      <nav className="hub-objects" aria-label="Objetos de la oficina">
        <a href="#unirse">
          <Phone size={30} />
          <span>
            <b>Teléfono de la central</b>
            <small>Entrar con un código</small>
          </span>
          <ArrowUpRight size={15} />
        </a>
        <a href="#mis-expedientes">
          <Archive size={30} />
          <span>
            <b>Archivador</b>
            <small>Consultar mi historial</small>
          </span>
          <ArrowUpRight size={15} />
        </a>
        <a href="#perfil-investigador">
          <Fingerprint size={30} />
          <span>
            <b>Mi credencial</b>
            <small>{data.profile?.name ?? "Elegir alias y personaje"}</small>
          </span>
          <ArrowUpRight size={15} />
        </a>
      </nav>
      <div className="hub-case-tray">
        <p className="eyebrow">EXPEDIENTES SOBRE TU MESA</p>
        <div className="hub-folders">
          {data.cases.map((c) => (
            <button
              type="button"
              key={c.slug}
              className={`hub-folder hub-folder-${c.theme}`}
              aria-pressed={selected === c.slug}
              onClick={() => {
                onSelect(c.slug);
                document
                  .getElementById("abrir-expediente")
                  ?.scrollIntoView({ block: "start" });
                document
                  .querySelector<HTMLInputElement>(
                    `input[name="caseSlug"][value="${c.slug}"]`,
                  )
                  ?.focus({ preventScroll: true });
              }}
            >
              <span className="hub-folder-tab">
                <FolderOpen size={14} /> CASO {casePresentation[c.theme].number}
              </span>
              <Image
                unoptimized
                src={casePresentation[c.theme].image}
                alt=""
                width={280}
                height={130}
              />
              <span className="hub-folder-title">{c.title}</span>
              <small>
                {selected === c.slug
                  ? "Seleccionado · preparar sala"
                  : "Abrir expediente"}{" "}
                <ArrowUpRight size={12} />
              </small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
