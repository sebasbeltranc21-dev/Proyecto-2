/** Existing keys keep saved profiles compatible; camara adds the fifth character. */
export const characters = [
  {
    id: "lupa",
    name: "Álex",
    role: "Observador",
    image: "/characters/alex.webp",
  },
  {
    id: "huella",
    name: "Bruno",
    role: "Analista",
    image: "/characters/bruno.webp",
  },
  {
    id: "llave",
    name: "Leo",
    role: "Explorador",
    image: "/characters/leo.webp",
  },
  {
    id: "luna",
    name: "Nora",
    role: "Investigadora",
    image: "/characters/nora.webp",
  },
  {
    id: "camara",
    name: "Vera",
    role: "Fotógrafa",
    image: "/characters/vera.webp",
  },
] as const;
export type CharacterId = (typeof characters)[number]["id"];
export function characterFor(id: string) {
  return characters.find((character) => character.id === id) ?? characters[0];
}
