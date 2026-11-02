import Image from "next/image";
import { domeCharacters } from "@/lib/dome-characters";
import { chibiCharacter } from "@/lib/chibi-characters";
import { casePresentation, type CaseTheme } from "@/lib/case-presentation";
import type { Suspect } from "@/lib/types";
import { ChibiEvidenceObject } from "./chibi-evidence-object";

/** Called only by the post-settlement ending player. Art never supplies an answer. */
export function DomeCinematicScene({
  frame,
  won,
  portrait,
  name,
  cast = [],
  theme = "observatory",
}: {
  frame: number;
  won: boolean;
  portrait?: string;
  name?: string;
  cast?: Suspect[];
  theme?: CaseTheme;
}) {
  const person = chibiCharacter(name, portrait);
  const lineup =
    theme === "observatory"
      ? Object.values(domeCharacters)
      : cast.flatMap((s) => {
          const character = chibiCharacter(s.name, s.portrait);
          return character ? [character] : [];
        });
  const finalObject = {
    museum: "gem",
    train: "report",
    theater: "report",
    lighthouse: "lens",
    observatory: "disk",
  }[theme];
  const reveal = Boolean(
    person && (won ? frame === 1 || frame === 2 : frame === 3),
  );
  return (
    <div
      className="dome-film"
      data-shot={frame}
      data-case={theme}
      data-detained={won && frame >= 2}
      data-cast-count={lineup.length}
      data-outcome={won ? "solved" : "open"}
    >
      <Image
        className={`dome-film-backdrop ${frame < 2 ? "visible" : ""}`}
        src={casePresentation[theme].image}
        alt=""
        width={1280}
        height={720}
        sizes="(max-width: 760px) 100vw, 960px"
        loading="eager"
      />
      <Image
        className={`dome-film-backdrop ${frame >= 2 ? "visible" : ""}`}
        src={
          theme === "observatory"
            ? "/cases/dome/terrace.webp"
            : `/cases/cinematics/${theme}-closing.webp`
        }
        alt=""
        width={1280}
        height={720}
        sizes="(max-width: 760px) 100vw, 960px"
        loading="eager"
      />
      <div className="dome-film-shade" />
      {(frame === 0 || (!won && frame < 3)) && (
        <div className="dome-film-cast">
          {lineup.map((character) => (
            <Image
              key={character.name}
              src={character.image}
              alt=""
              width={280}
              height={400}
              sizes="(max-width: 600px) 22vw, 200px"
              loading="eager"
            />
          ))}
        </div>
      )}
      {frame > 0 && (
        <Image
          className="dome-film-lead dome-film-actor"
          src="/characters/alex.webp"
          alt=""
          width={360}
          height={512}
          sizes="(max-width: 600px) 27vw, 240px"
          loading="eager"
        />
      )}
      {reveal && person && (
        <Image
          className="dome-film-interest dome-film-actor"
          src={person.image}
          alt=""
          width={420}
          height={600}
          sizes="(max-width: 600px) 27vw, 240px"
          loading="eager"
        />
      )}
      {won && frame >= 2 && (
        <Image
          className="dome-film-partner dome-film-actor"
          src="/characters/vera.webp"
          alt=""
          width={400}
          height={512}
          sizes="(max-width: 600px) 27vw, 240px"
          loading="eager"
        />
      )}
      {won && frame === 1 && <div className="dome-film-dossier">✦</div>}
      {won && frame === 3 && (
        <div className="dome-film-disk">
          <ChibiEvidenceObject kind={finalObject} />
        </div>
      )}
    </div>
  );
}
