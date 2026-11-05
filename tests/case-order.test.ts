import {expect,test} from "vitest";
import {orderedCases} from "../src/lib/case-order";
import {casePresentation,type CaseTheme} from "../src/lib/case-presentation";
import type {CaseSummary} from "../src/lib/types";
test("both catalogs use numeric case order without modifying the snapshot",()=>{
 const themes:CaseTheme[]=["train","observatory","lighthouse","museum","theater"];
 const cases:CaseSummary[]=themes.map(theme=>({theme,slug:theme,title:theme,intro:"",suspect_count:4}));
 const sorted=orderedCases(cases);
 expect(sorted.map(c=>casePresentation[c.theme].number)).toEqual(["001","002","003","004","005"]);
 expect(cases.map(c=>c.theme)).toEqual(themes);
});
