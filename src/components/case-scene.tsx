import Image from "next/image";
import type { CSSProperties } from "react";

export function CaseScene({ theme }: { theme: "museum" | "train" }) {
  const train = theme === "train";
  return (
    <div className={`case-scene ${train ? "train-scene" : "museum-scene"}`}>
      <Image
        unoptimized
        src={train ? "/train.svg" : "/museum.svg"}
        alt={
          train
            ? "El Expreso Medianoche detenido junto al túnel bajo la lluvia"
            : "La vitrina del zafiro en el Museo Áurea"
        }
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
