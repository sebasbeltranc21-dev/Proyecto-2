/** Existing keys keep saved profiles compatible; camara adds the fifth character. */
export const characters = [
  {
    id: "lupa",
    name: "Álex",
    role: "Observador",
    image: "/characters/alex.webp",
    seatedImage: "/characters/seated/alex-corrected.png",
  },
  {
    id: "huella",
    name: "Bruno",
    role: "Analista",
    image: "/characters/bruno.webp",
    seatedImage: "/characters/seated/bruno.webp",
  },
  {
    id: "llave",
    name: "Leo",
    role: "Explorador",
    image: "/characters/leo.webp",
    seatedImage: "/characters/seated/leo.webp",
  },
  {
    id: "luna",
    name: "Nora",
    role: "Investigadora",
    image: "/characters/nora.webp",
    seatedImage: "/characters/seated/nora.webp",
  },
  {
    id: "camara",
    name: "Vera",
    role: "Fotógrafa",
    image: "/characters/vera.webp",
    seatedImage: "/characters/seated/vera.webp",
  },
] as const;
export type CharacterId = (typeof characters)[number]["id"];
export function characterFor(id: string) {
  return characters.find((character) => character.id === id) ?? characters[0];
}
