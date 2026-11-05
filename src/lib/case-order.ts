import { casePresentation } from "./case-presentation";
import type { CaseSummary } from "./types";

/** Stable display order; never mutate the authorized snapshot. */
export function orderedCases(cases: readonly CaseSummary[]) {
 return [...cases].sort((a,b)=>Number(casePresentation[a.theme].number)-Number(casePresentation[b.theme].number));
}
