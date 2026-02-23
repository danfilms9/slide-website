"use client";

import { useMemo } from "react";

const PARTICLE_COUNT = 40;
const MIN_SIZE = 4;
const MAX_SIZE = 8;
const MIN_OPACITY = 0.3;
const MAX_OPACITY = 0.7;
const MIN_DURATION = 8;
const MAX_DURATION = 15;

export function FrontSnow() {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
      opacity: MIN_OPACITY + Math.random() * (MAX_OPACITY - MIN_OPACITY),
      duration: MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION),
      delay: -Math.random() * 20,
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{
        zIndex: 2,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.left}vw`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            filter: "blur(1px)",
            animation: `front-snow-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
