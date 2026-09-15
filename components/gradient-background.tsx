"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useSkipHeavyEffects } from "@/components/motion";

const TONES = {
  dark: {
    fallback:
      "radial-gradient(130% 95% at 12% 8%, #d97757 0%, transparent 58%), radial-gradient(95% 75% at 88% 12%, #e3dacc 0%, transparent 48%), radial-gradient(90% 90% at 70% 85%, #c4785a 0%, transparent 52%), #2a211c",
    colorBack: "hsl(18, 22%, 12%)",
    colors: ["hsl(16, 62%, 52%)", "hsl(28, 48%, 72%)", "hsl(40, 40%, 90%)"],
    intensity: 0.72,
    noise: 0.12,
  },
  light: {
    fallback:
      "radial-gradient(130% 95% at 10% 8%, #e8d4c8 0%, transparent 54%), radial-gradient(95% 75% at 88% 14%, #e3dacc 0%, transparent 50%), radial-gradient(90% 90% at 72% 88%, #d9cfc4 0%, transparent 54%), #faf9f5",
    colorBack: "hsl(40, 33%, 97%)",
    colors: ["hsl(18, 28%, 82%)", "hsl(32, 18%, 88%)", "hsl(40, 8%, 90%)"],
    intensity: 0.42,
    noise: 0.08,
  },
} as const;

export function GradientBackground({
  tone = "dark",
}: {
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];
  const skipHeavy = useSkipHeavyEffects();
  return (
    <>
      <div
        className="absolute inset-0 h-full w-full"
        style={{ background: t.fallback }}
      />
      {skipHeavy ? null : (
        <GrainGradient
          className="absolute inset-0 h-full w-full"
          style={{ width: "100%", height: "100%" }}
          colorBack={t.colorBack}
          colors={[...t.colors]}
          shape="corners"
          softness={0.85}
          intensity={t.intensity}
          noise={t.noise}
          speed={1}
          scale={1}
          rotation={0}
          offsetX={0}
          offsetY={0}
        />
      )}
    </>
  );
}
