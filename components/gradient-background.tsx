"use client";

import { GrainGradient } from "@paper-design/shaders-react";

export function GradientBackground() {
  return (
    <GrainGradient
      className="absolute inset-0 -z-10 h-full w-full"
      style={{ width: "100%", height: "100%" }}
      colorBack="hsl(0, 0%, 0%)"
      colors={[
        "hsl(193, 85%, 66%)",
        "hsl(196, 100%, 83%)",
        "hsl(195, 100%, 50%)",
      ]}
      shape="corners"
      softness={0.76}
      intensity={0.45}
      noise={0}
      speed={1}
      scale={1}
      rotation={0}
      offsetX={0}
      offsetY={0}
    />
  );
}
