import { domeCharacter } from "./dome-characters";

/** Public illustration metadata, independent of motives, clues and solutions. */
export const caseCharacters = {
  "Clara Vidal": {
    name: "Clara Vidal",
    image: "/cases/cast/museum-clara.webp",
  },
  "Bruno Salas": {
    name: "Bruno Salas",
    image: "/cases/cast/museum-bruno.webp",
  },
  "Inés Duarte": { name: "Inés Duarte", image: "/cases/cast/museum-ines.webp" },
  "Mateo Ríos": { name: "Mateo Ríos", image: "/cases/cast/museum-mateo.webp" },
  "Elena Cruz": { name: "Elena Cruz", image: "/cases/cast/train-elena.webp" },
  "Tomás León": { name: "Tomás León", image: "/cases/cast/train-tomas.webp" },
  "Vera Solís": { name: "Vera Solís", image: "/cases/cast/train-vera.webp" },
  "Hugo Marín": { name: "Hugo Marín", image: "/cases/cast/train-hugo.webp" },
  "Darío Montes": {
    name: "Darío Montes",
    image: "/cases/cast/train-dario.webp",
  },
  "Mara Vidal": { name: "Mara Vidal", image: "/cases/cast/theater-mara.webp" },
  "Iván Ríos": { name: "Iván Ríos", image: "/cases/cast/theater-ivan.webp" },
  "Celia Mora": { name: "Celia Mora", image: "/cases/cast/theater-celia.webp" },
  "Óscar Luna": { name: "Óscar Luna", image: "/cases/cast/theater-oscar.webp" },
  "Damián Soto": {
    name: "Damián Soto",
    image: "/cases/cast/lighthouse-damian.webp",
  },
  "Mateo Roca": {
    name: "Mateo Roca",
    image: "/cases/cast/lighthouse-mateo.webp",
  },
  "Celia Vela": {
    name: "Celia Vela",
    image: "/cases/cast/lighthouse-celia.webp",
  },
  "Iris Alba": { name: "Iris Alba", image: "/cases/cast/lighthouse-iris.webp" },
} as const;

export function chibiCharacter(name?: string, portrait?: string) {
  return Object.hasOwn(caseCharacters, name ?? "")
    ? caseCharacters[name as keyof typeof caseCharacters]
    : domeCharacter(portrait);
}
