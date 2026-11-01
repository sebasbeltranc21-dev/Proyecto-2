import Image from "next/image";
import { casePresentation, type CaseTheme } from "@/lib/case-presentation";
import type { CSSProperties } from "react";

export function CaseScene({ theme }: { theme: CaseTheme }) {
  const train = theme === "train";
  return (
    <div className={`case-scene ${theme}-scene`}>
      <Image
        unoptimized
        src={casePresentation[theme].image}
        alt={casePresentation[theme].alt}
        width={1200}
        height={720}
      />
      {train && (
        <div className="scene-rain" aria-hidden="true">
          {[7, 19, 31, 43, 55, 67, 79, 91].map((x, i) => (
            <i
              key={x}
              style={
                {
                  left: `${x}%`,
                  "--rain-delay": `${i * 0.08}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      <div className="scene-ambience" aria-hidden="true" />
    </div>
  );
}
