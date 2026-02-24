"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Snow } from "./Snow";
import { FloatingScreen } from "./FloatingScreen";
import { CameraController } from "./CameraController";
import { ScreenOccluder } from "./ScreenOccluder";
import { useMediaQuery } from "@/app/lib/hooks/useMediaQuery";
import { useExperienceStore } from "@/app/lib/store";
import { FadeTransition } from "@/app/components/ui/FadeTransition";

const FOG_NEAR = 1;
const FOG_FAR = 60;

function SceneContent({
  isMobile,
  portalRef,
  isVotePage,
}: {
  isMobile: boolean;
  portalRef: React.RefObject<HTMLDivElement | null>;
  isVotePage: boolean;
}) {
  return (
    <>
      <fog attach="fog" args={["#d0d0d0", FOG_NEAR, FOG_FAR]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
      <FloatingScreen portalRef={portalRef} isMobile={isMobile} />
      <ScreenOccluder />
      <Snow isMobile={isMobile} />
      <CameraController isMobile={isMobile} isVotePage={isVotePage} />
    </>
  );
}

const LOADING_DISSOLVE_MS = 1000;

export function Scene({ isVotePage = false }: { isVotePage?: boolean }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const portalRef = useRef<HTMLDivElement>(null);
  const initialLoadComplete = useExperienceStore((s) => s.initialLoadComplete);

  return (
    <>
      {/* z-index 0: light grey background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#d0d0d0",
          zIndex: 0,
        }}
      />
      {/* z-index 1: HTML portal target for screen content (real DOM — buttons, iframes) */}
      <div
        ref={portalRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
        }}
      />
      {/* z-index 2: R3F Canvas — transparent, pointer-events none so clicks hit z-index 1 */}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
          background: "transparent",
        }}
        camera={{
          position: isMobile ? [0, 0, 35] : [0, 0, 45],
          fov: 75,
        }}
      >
        <SceneContent isMobile={isMobile} portalRef={portalRef} isVotePage={isVotePage} />
      </Canvas>
      {/* z-index 10: initial black loading overlay — dissolves when camera move triggers */}
      <FadeTransition
        show={!initialLoadComplete}
        duration={LOADING_DISSOLVE_MS}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#000",
            zIndex: 10,
          }}
        />
      </FadeTransition>
    </>
  );
}
