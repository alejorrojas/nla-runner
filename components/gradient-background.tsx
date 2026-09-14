"use client";

import { GrainGradient } from "@paper-design/shaders-react";

export function GradientBackground() {
  return (
    <>
      <div
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          background:
            "radial-gradient(120% 90% at 12% 8%, #d97757 0%, transparent 55%), radial-gradient(90% 70% at 88% 12%, #e3dacc 0%, transparent 46%), radial-gradient(80% 80% at 70% 85%, #c4785a 0%, transparent 50%), #2a211c",
        }}
      />
      <GrainGradient
        className="absolute inset-0 -z-10 h-full w-full"
        style={{ width: "100%", height: "100%" }}
        colorBack="hsl(18, 22%, 12%)"
        colors={[
          "hsl(16, 62%, 52%)",
          "hsl(28, 48%, 72%)",
          "hsl(40, 40%, 90%)",
        ]}
        shape="corners"
        softness={0.7}
        intensity={0.72}
        noise={0.12}
        speed={1}
        scale={1}
        rotation={0}
        offsetX={0}
        offsetY={0}
      />
    </>
  );
}
