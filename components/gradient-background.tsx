"use client";

import { useEffect, useRef } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "framer-motion";
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

function usePointerField(active: boolean) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el || !active) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      tx = (event.clientX / w) * 2 - 1;
      ty = (event.clientY / h) * 2 - 1;
    };

    const tick = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.transform = `translate3d(${x * 36}px, ${y * 28}px, 0) scale(1.14)`;
      raf = requestAnimationFrame(tick);
    };

    el.style.transform = "translate3d(0, 0, 0) scale(1.14)";
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  return layerRef;
}

export function GradientBackground({
  tone = "dark",
}: {
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];
  const skipHeavy = useSkipHeavyEffects();
  const reduce = useReducedMotion();
  const layerRef = usePointerField(!skipHeavy && !reduce);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none absolute inset-0 h-full w-full will-change-transform"
      style={{ transform: "translate3d(0, 0, 0) scale(1.14)" }}
    >
      <div className="absolute inset-0 h-full w-full" style={{ background: t.fallback }} />
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
          speed={0.85}
          scale={1}
          rotation={0}
          offsetX={0}
          offsetY={0}
        />
      )}
    </div>
  );
}
