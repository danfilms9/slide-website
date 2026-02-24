"use client";

import { useState, useEffect } from "react";

const GRAIN_OPACITY = 0.08;
const GRAIN_SIZE = 200;

/**
 * Full-window film grain overlay. Noise is applied only after mount to avoid
 * server/client style mismatch (hydration warning).
 * Uses a high z-index so it sits on top of all HTML (portal, menus, content).
 */
const EFFECTS_LAYER_Z_INDEX = 100;

export function FilmGrainOverlay() {
  const [noiseDataUrl, setNoiseDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 256);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    setNoiseDataUrl(canvas.toDataURL("image/png"));
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        zIndex: EFFECTS_LAYER_Z_INDEX,
        ...(noiseDataUrl && {
          backgroundImage: `url(${noiseDataUrl})`,
          backgroundRepeat: "repeat",
          backgroundSize: `${GRAIN_SIZE}px ${GRAIN_SIZE}px`,
        }),
        opacity: GRAIN_OPACITY,
        mixBlendMode: "overlay",
      }}
    />
  );
}
