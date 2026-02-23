"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const EASE_IN_OUT = "cubic-bezier(0.42, 0, 0.58, 1)";

export interface HeightThenOpacityTransitionProps {
  show: boolean;
  /** Duration for height animation (expand/collapse) */
  heightDuration?: number;
  /** Duration for opacity animation */
  opacityDuration?: number;
  /** Max height when expanded (e.g. "120px"). Content should fit within this. */
  maxHeight?: string;
  /** When true, height and opacity animate together on open (fade starts right away) */
  parallel?: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * When opening: animates height 0 → maxHeight (smooth easing); then opacity 0 → 1 (or parallel with height if parallel=true).
 * When closing: animates opacity 1 → 0, then height → 0.
 */
export function HeightThenOpacityTransition({
  show,
  heightDuration = 600,
  opacityDuration = 600,
  maxHeight = "150px",
  parallel = false,
  onComplete,
  children,
  className = "",
}: HeightThenOpacityTransitionProps) {
  const [mounted, setMounted] = useState(show);
  const [heightOpen, setHeightOpen] = useState(show);
  const [opacityOn, setOpacityOn] = useState(show);
  const opacityOutDoneRef = useRef(false);
  const prevShowRef = useRef(show);

  useEffect(() => {
    if (show) {
      setMounted(true);
      if (!prevShowRef.current) {
        opacityOutDoneRef.current = false;
        setOpacityOn(false);
        setHeightOpen(false);
        const id = requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHeightOpen(true);
            if (parallel) setOpacityOn(true);
          });
        });
        return () => cancelAnimationFrame(id);
      }
    } else {
      setOpacityOn(false);
      opacityOutDoneRef.current = false;
    }
    prevShowRef.current = show;
  }, [show, parallel]);

  const handleHeightTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "max-height") return;
      if (!show) {
        setMounted(false);
        onComplete?.();
        return;
      }
      if (heightOpen && !parallel) {
        setOpacityOn(true);
      }
    },
    [show, heightOpen, parallel, onComplete]
  );

  const handleOpacityTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "opacity") return;
      if (!show && opacityOutDoneRef.current === false) {
        opacityOutDoneRef.current = true;
        setHeightOpen(false);
      }
    },
    [show]
  );

  if (!mounted) return null;

  return (
    <div
      className={className}
      style={{
        overflow: "hidden",
        maxHeight: heightOpen ? maxHeight : "0",
        transition: `max-height ${heightDuration}ms ${EASE_IN_OUT}`,
      }}
      onTransitionEnd={handleHeightTransitionEnd}
    >
      <div
        style={{
          opacity: opacityOn ? 1 : 0,
          transition: `opacity ${opacityDuration}ms ${EASE_IN_OUT}`,
          pointerEvents: opacityOn ? "auto" : "none",
        }}
        onTransitionEnd={handleOpacityTransitionEnd}
      >
        {children}
      </div>
    </div>
  );
}
