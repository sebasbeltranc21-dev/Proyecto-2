export type CaseTheme =
  "museum" | "train" | "theater" | "lighthouse" | "observatory";
export const casePresentation = {
  museum: {
    number: "001",
    image: "/museum-chibi.webp",
    alt: "La vitrina del zafiro en el Museo Áurea",
    map: "El plano del museo",
  },
  train: {
    number: "002",
    image: "/train-chibi.webp",
    alt: "El Expreso Medianoche detenido junto al túnel bajo la lluvia",
    map: "Los vagones del expreso",
  },
  theater: {
    number: "003",
    image: "/theater-chibi.webp",
    alt: "El escenario del Teatro Bellavista, con el atril vacío y el telón rojo",
    map: "Entre bastidores del teatro",
  },
  lighthouse: {
    number: "004",
    image: "/lighthouse.webp",
    alt: "La linterna del Faro Bruma, con su soporte vacío frente al mar bajo la tormenta",
    map: "Los rincones del Faro Bruma",
  },
  observatory: {
    number: "005",
    image: "/cases/dome/cover.webp",
    alt: "La cúpula del Planetario Nácar y el proyector estelar de latón",
    map: "Bajo la cúpula de Nácar",
  },
} as const;
