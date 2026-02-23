"use client";

import { useState, useEffect, useCallback } from "react";
import { FadeTransition } from "@/app/components/ui/FadeTransition";
import { SlideButton } from "@/app/components/ui/SlideButton";
import { useExperienceStore } from "@/app/lib/store";

const SUBTEXT_FADE_MS = 400;
const MAYBE_NEXT_TO_SECOND_MS = 3000;

type VotePromptNoFlow = null | "maybe" | "second";

export function VotePromptScreen() {
  const setScreen = useExperienceStore((s) => s.setScreen);
  const isLoggedIn = useExperienceStore((s) => s.isLoggedIn);

  const [noFlow, setNoFlow] = useState<VotePromptNoFlow>(null);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    setShowSubtext(true);
    const t = setTimeout(() => setShowButtons(true), SUBTEXT_FADE_MS);
    return () => clearTimeout(t);
  }, []);

  const handleYes = useCallback(() => {
    if (isLoggedIn) {
      setScreen("vote");
    } else {
      setScreen("login");
    }
  }, [isLoggedIn, setScreen]);

  const handleNo = useCallback(() => setNoFlow("maybe"), []);

  useEffect(() => {
    if (noFlow !== "maybe") return;
    const t = setTimeout(() => setNoFlow("second"), MAYBE_NEXT_TO_SECOND_MS);
    return () => clearTimeout(t);
  }, [noFlow]);

  const promptContent =
    noFlow === "maybe"
      ? "Maybe next time..."
      : noFlow === "second"
        ? "Changed your mind?"
        : "Want to help choose what comes next?";

  const showYesNoButtons = noFlow !== "maybe";
  const showYesOnly = noFlow === "second";

  const subtextStyle = {
    fontSize: 14,
    fontWeight: 300,
    maxWidth: 280,
    lineHeight: 1.6,
    textAlign: "center" as const,
    margin: 0,
    marginTop: 12,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#000",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: 24,
        boxSizing: "border-box",
        background: "#e5e5e5",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 600,
          margin: 0,
          textAlign: "center",
        }}
      >
        Vote on the 2nd Release
      </h1>

      <FadeTransition show={showSubtext} duration={SUBTEXT_FADE_MS} fadeInOnMount>
        <p style={subtextStyle}>{promptContent}</p>
      </FadeTransition>

      {showButtons && (
        <FadeTransition show duration={SUBTEXT_FADE_MS} fadeInOnMount>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            {!showYesOnly && (
              <SlideButton variant="ghost" onClick={handleNo}>
                no
              </SlideButton>
            )}
            <SlideButton variant="primary" onClick={handleYes}>
              yes
            </SlideButton>
          </div>
        </FadeTransition>
      )}
    </div>
  );
}
