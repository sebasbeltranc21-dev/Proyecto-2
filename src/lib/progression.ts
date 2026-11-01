export const ranks = [
  { name: "Novato", games: 0, wins: 0 },
  { name: "Detective Junior", games: 1, wins: 0 },
  { name: "Inspector", games: 3, wins: 1 },
  { name: "Detective Experto", games: 8, wins: 3 },
  { name: "Detective Élite", games: 15, wins: 8 },
] as const;
export const achievements = [
  {
    id: "first_case",
    name: "Primer expediente",
    description: "Terminaste tu primera investigación.",
    condition: "Completar 1 caso",
  },
  {
    id: "first_win",
    name: "La verdad sale a la luz",
    description: "Tu equipo resolvió un misterio.",
    condition: "Conseguir 1 victoria de equipo",
  },
  {
    id: "three_cases",
    name: "Oficio de detective",
    description: "Tres investigaciones en tu archivo.",
    condition: "Completar 3 casos",
  },
  {
    id: "three_wins",
    name: "Ojo para los detalles",
    description: "Tres casos resueltos en equipo.",
    condition: "Conseguir 3 victorias de equipo",
  },
  {
    id: "all_scenes",
    name: "Tras todas las huellas",
    description: "Investigaste escenarios diferentes.",
    condition: "Completar 3 casos distintos",
  },
] as const;
