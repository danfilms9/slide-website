"use client";

import { useState, useEffect, useCallback } from "react";
import { Html } from "@react-three/drei";
import { useExperienceStore, type ScreenId } from "@/app/lib/store";
import { useExperienceFlow } from "@/app/lib/hooks/useExperienceFlow";
import { FadeTransition } from "@/app/components/ui/FadeTransition";
import { IntroScreen } from "@/app/components/screens/IntroScreen";
import { VideoScreen } from "@/app/components/screens/VideoScreen";
import { VotePromptScreen } from "@/app/components/screens/VotePromptScreen";
import { LoginScreen } from "@/app/components/screens/LoginScreen";
import { VoteScreen } from "@/app/components/screens/VoteScreen";

const DESKTOP_DISTANCE_FACTOR = 8;
const MOBILE_DISTANCE_FACTOR = 5.5;

const SCREEN_FADE_MS = 400;

function ScreenContent({ screenId }: { screenId: ScreenId }) {
  switch (screenId) {
    case "intro":
      return <IntroScreen />;
    case "video":
      return <VideoScreen />;
    case "votePrompt":
      return <VotePromptScreen />;
    case "login":
      return <LoginScreen />;
    case "vote":
      return <VoteScreen />;
    default:
      return <IntroScreen />;
  }
}

function FloatingScreenContent({
  portalRef,
  isMobile,
}: {
  portalRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
}) {
  useExperienceFlow();
  const currentScreen = useExperienceStore((s) => s.currentScreen);
  const [displayedScreen, setDisplayedScreen] = useState<ScreenId>(currentScreen);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (currentScreen === displayedScreen) return;
    setVisible(false);
  }, [currentScreen, displayedScreen]);

  const handleFadeComplete = useCallback(() => {
    if (!visible) {
      setDisplayedScreen(currentScreen);
      setVisible(true);
    }
  }, [visible, currentScreen]);

  const distanceFactor = isMobile ? MOBILE_DISTANCE_FACTOR : DESKTOP_DISTANCE_FACTOR;
  const cameraProgress = useExperienceStore((s) => s.cameraProgress);
  const screenOpacity = Math.min(1, cameraProgress);

  return (
    <group position={[0, 0, 0]}>
      <Html
        portal={portalRef as React.MutableRefObject<HTMLElement>}
        transform
        position={[0, 0, 0]}
        distanceFactor={distanceFactor}
        style={{
          width: 360,
          height: 640,
          aspectRatio: "9/16",
          backgroundColor: "#e5e5e5",
          border: "2px solid #444",
          borderRadius: 8,
          boxShadow: "0 0 40px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: screenOpacity > 0 ? "auto" : "none",
          overflow: "hidden",
          opacity: screenOpacity,
          transition: "opacity 0.1s linear",
        }}
      >
        <FadeTransition
          show={visible}
          duration={SCREEN_FADE_MS}
          onComplete={handleFadeComplete}
          className="w-full h-full"
        >
          <ScreenContent screenId={displayedScreen} />
        </FadeTransition>
      </Html>
    </group>
  );
}

export function FloatingScreen({
  portalRef,
  isMobile = false,
}: {
  portalRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
  isMobile?: boolean;
}) {
  return (
    <FloatingScreenContent portalRef={portalRef} isMobile={isMobile} />
  );
}
