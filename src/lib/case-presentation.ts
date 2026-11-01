export type CaseTheme = "museum" | "train" | "theater";
export const casePresentation = {
  museum: {
    number: "001",
    image: "/museum.svg",
    alt: "La vitrina del zafiro en el Museo Áurea",
    map: "El plano del museo",
  },
  train: {
    number: "002",
    image: "/train.svg",
    alt: "El Expreso Medianoche detenido junto al túnel bajo la lluvia",
    map: "Los vagones del expreso",
  },
  theater: {
    number: "003",
    image: "/theater.svg",
    alt: "El escenario del Teatro Bellavista, con el atril vacío y el telón rojo",
    map: "Entre bastidores del teatro",
  },
} as const;
