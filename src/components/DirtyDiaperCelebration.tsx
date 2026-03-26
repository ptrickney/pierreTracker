"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Particle = {
  angle: number;
  distance: number;
  delay: number;
  sizeRem: number;
  emoji: string;
  rot: number;
};

function makeParticles(seed: number): Particle[] {
  const count = 42;
  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (Math.PI * 2 * i) / count + seed * 0.01;
    const angle = baseAngle + (Math.random() - 0.5) * 0.55;
    const distance = 90 + Math.random() * 320;
    return {
      angle,
      distance,
      delay: Math.random() * 0.12,
      sizeRem: 1.25 + Math.random() * 1.35,
      emoji: Math.random() > 0.88 ? "🎉" : "💩",
      rot: 280 + Math.random() * 400,
    };
  });
}

type DirtyDiaperCelebrationProps = {
  show: boolean;
  burstKey: number;
  onFinished?: () => void;
};

export default function DirtyDiaperCelebration({
  show,
  burstKey,
  onFinished,
}: DirtyDiaperCelebrationProps) {
  const labelId = useId();
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const particles = useMemo(() => makeParticles(burstKey), [burstKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!show || !onFinished) return;
    const t = window.setTimeout(onFinished, reduceMotion ? 1600 : 3000);
    return () => window.clearTimeout(t);
  }, [show, onFinished, reduceMotion]);

  if (!mounted || !show) return null;

  const reduced = reduceMotion;

  const node = (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
      role="status"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">
        Dirty diaper logged. Celebration animation playing.
      </span>

      {reduced ? (
        <div className="animate-celebration-fade rounded-2xl border border-amber-200 bg-amber-50/95 px-6 py-4 text-center shadow-lg backdrop-blur-sm dark:border-amber-800 dark:bg-amber-950/90">
          <p className="text-4xl" aria-hidden>
            💩
          </p>
          <p className="mt-2 text-lg font-bold text-amber-900 dark:text-amber-100">
            He did it!
          </p>
        </div>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-b from-amber-100/40 via-transparent to-amber-50/30 animate-celebration-fade dark:from-amber-900/35 dark:to-amber-950/25"
            aria-hidden
          />
          <div className="relative flex h-full w-full items-center justify-center">
            <p
              className="animate-poop-hero select-none text-7xl drop-shadow-md sm:text-8xl"
              aria-hidden
            >
              💩
            </p>
            {particles.map((p, i) => {
              const dx = Math.cos(p.angle) * p.distance;
              const dy = Math.sin(p.angle) * p.distance + 100;
              return (
                <span
                  key={`${burstKey}-${i}`}
                  className="animate-poop-burst absolute left-1/2 top-1/2 select-none"
                  style={{
                    fontSize: `${p.sizeRem}rem`,
                    animationDelay: `${p.delay}s`,
                    ["--dx" as string]: `${dx}px`,
                    ["--dy" as string]: `${dy}px`,
                    ["--rot" as string]: `${p.rot}deg`,
                  }}
                  aria-hidden
                >
                  {p.emoji}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  return createPortal(node, document.body);
}
