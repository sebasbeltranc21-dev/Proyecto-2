import Image from "next/image";
import { domeCharacters, domeCharacter } from "@/lib/dome-characters";

/** Called only by the post-settlement ending player. Art never supplies an answer. */
export function DomeCinematicScene({
  frame,
  won,
  portrait,
}: {
  frame: number;
  won: boolean;
  portrait?: string;
}) {
  const person = domeCharacter(portrait);
  const reveal = Boolean(person && (won ? frame >= 1 : frame === 3));
  return (
    <div
      className="dome-film"
      data-shot={frame}
      data-outcome={won ? "solved" : "open"}
    >
      <Image
        className={`dome-film-backdrop ${frame < 2 ? "visible" : ""}`}
        src="/cases/dome/cover.webp"
        alt=""
        width={1280}
        height={720}
        loading="eager"
      />
      <Image
        className={`dome-film-backdrop ${frame >= 2 ? "visible" : ""}`}
        src="/cases/dome/terrace.webp"
        alt=""
        width={1280}
        height={720}
        loading="eager"
      />
      <div className="dome-film-shade" />
      {(frame === 0 || (!won && frame < 3)) && (
        <div className="dome-film-cast">
          {Object.entries(domeCharacters).map(([key, character]) => (
            <Image
              key={key}
              src={character.image}
              alt=""
              width={280}
              height={400}
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
          loading="eager"
        />
      )}
      {won && frame === 1 && <div className="dome-film-dossier">✦</div>}
      {won && frame === 3 && (
        <div className="dome-film-disk">
          <svg viewBox="0 0 120 120" fill="none" focusable="false">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="#43355f"
              stroke="#f4d69a"
              strokeWidth="6"
            />
            <circle cx="60" cy="60" r="41" stroke="#b3d6ee" strokeWidth="2" />
            <path
              d="m60 24 9 24 25 3-19 16 5 26-20-14-23 14 6-26-18-16 26-3Z"
              fill="#f4d69a"
              stroke="#6f516d"
              strokeWidth="2"
            />
            <circle cx="60" cy="60" r="7" fill="#43355f" />
          </svg>
        </div>
      )}
    </div>
  );
}
