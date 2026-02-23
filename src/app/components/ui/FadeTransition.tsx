"use client";

import { useState, useEffect, useCallback } from "react";

export interface FadeTransitionProps {
  show: boolean;
  duration?: number;
  delay?: number;
  /** When true, start at opacity 0 when show is true (fade in on mount) */
  fadeInOnMount?: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FadeTransition({
  show,
  duration = 500,
  delay = 0,
  fadeInOnMount = false,
  onComplete,
  children,
  className = "",
}: FadeTransitionProps) {
  const [visible, setVisible] = useState(show);
  const [opacity, setOpacity] = useState(show && !fadeInOnMount ? 1 : 0);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // When fadeInOnMount, defer so the browser paints opacity 0 before we transition to 1
      const deferMs = fadeInOnMount ? Math.max(delay, 40) : delay;
      const t = setTimeout(() => setOpacity(1), deferMs);
      return () => clearTimeout(t);
    } else {
      setOpacity(0);
    }
  }, [show, delay, fadeInOnMount]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "opacity") return;
      if (!show) {
        setVisible(false);
      }
      onComplete?.();
    },
    [show, onComplete]
  );

  return (
    <div
      className={className}
      style={{
        opacity,
        pointerEvents: show ? "auto" : "none",
        transition: `opacity ${duration}ms ease`,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {visible ? children : null}
    </div>
  );
}
