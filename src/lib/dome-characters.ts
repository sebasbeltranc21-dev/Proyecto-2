/** Public art only; no role in determining guilt or the official answer. */
export const domeCharacters = {
  "dome-lia": { name: "Lía Ravel", image: "/cases/dome/lia.webp" },
  "dome-nico": { name: "Nico Ferrer", image: "/cases/dome/nico.webp" },
  "dome-emi": { name: "Emi Salvat", image: "/cases/dome/emi.webp" },
  "dome-gael": { name: "Gael Soler", image: "/cases/dome/gael.webp" },
} as const;
export function domeCharacter(portrait?: string) {
  return Object.hasOwn(domeCharacters, portrait ?? "")
    ? domeCharacters[portrait as keyof typeof domeCharacters]
    : undefined;
}
