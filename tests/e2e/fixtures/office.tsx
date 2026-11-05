import React from "react";
import { createRoot } from "react-dom/client";
import {OfficeHub} from "../../../src/components/office-hub";
import {OfficeArchive} from "../../../src/components/office-records";
import {casePresentation,type CaseTheme} from "../../../src/lib/case-presentation";
import type {HomeSnapshot} from "../../../src/lib/types";
import "../../../src/app/globals.css";
import "../../../src/app/investigation.css";
import "../../../src/app/office-room.css";
import "../../../src/app/chibi-ui.css";
import "../../../src/app/dome-case.css";
const themes:CaseTheme[]=["train","observatory","lighthouse","museum","theater"];
const data:HomeSnapshot={
profile:{id:"review",name:"Detective de revisión",avatar:"lupa"},
cases:themes.map(theme=>({slug:theme,title:"Caso "+casePresentation[theme].number,intro:"Revisión visual",theme,suspect_count:4})),
rooms:[],history:[],stats:{games:0,correct:0,points:0},leaderboard:[],
progression:{completed:0,wins:0,played:0,shared_clues:0,rank_index:0,achievements:{}}
};
createRoot(document.getElementById("root")!).render(<main className="shell dashboard"><h1>Revisión de oficina</h1><OfficeHub data={data}/><OfficeArchive data={data}/></main>);
