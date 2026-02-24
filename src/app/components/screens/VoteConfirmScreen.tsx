"use client";

import { useState, useEffect, useCallback } from "react";
import { FadeTransition } from "@/app/components/ui/FadeTransition";
import { useExperienceStore } from "@/app/lib/store";

const HOLD_1_MS = 2000;
const HOLD_2_MS = 3000;
const FADE_MS = 500;

type Step =
  | "vote-recorded"
  | "vote-recorded-out"
  | "welcome"
  | "welcome-out"
  | "done";

export function VoteConfirmScreen() {
  const setScreen = useExperienceStore((s) => s.setScreen);
  const [step, setStep] = useState<Step>("vote-recorded");

  // After "Vote Recorded" holds 2s, fade it out
  useEffect(() => {
    if (step !== "vote-recorded") return;
    const t = setTimeout(() => setStep("vote-recorded-out"), HOLD_1_MS);
    return () => clearTimeout(t);
  }, [step]);

  // After "Welcome" holds 3s, fade it out
  useEffect(() => {
    if (step !== "welcome") return;
    const t = setTimeout(() => setStep("welcome-out"), HOLD_2_MS);
    return () => clearTimeout(t);
  }, [step]);

  const onFirstFadeOutComplete = useCallback(() => setStep("welcome"), []);
  const onSecondFadeOutComplete = useCallback(() => setStep("done"), []);

  useEffect(() => {
    if (step !== "done") return;
    setScreen("dashboard");
    // This component renders inside R3F portal (no App Router context); update URL without useRouter
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/dashboard");
    }
  }, [step, setScreen]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: 24,
    boxSizing: "border-box",
  };

  return (
    <div style={containerStyle}>
      {(step === "vote-recorded" || step === "vote-recorded-out") && (
        <FadeTransition
          show={step === "vote-recorded"}
          duration={FADE_MS}
          fadeInOnMount
          onComplete={step === "vote-recorded-out" ? onFirstFadeOutComplete : undefined}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
              Vote Recorded
            </h1>
          </div>
        </FadeTransition>
      )}

      {(step === "welcome" || step === "welcome-out") && (
        <FadeTransition
          show={step === "welcome"}
          duration={FADE_MS}
          fadeInOnMount
          onComplete={step === "welcome-out" ? onSecondFadeOutComplete : undefined}
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 300, margin: 0 }}>
              Welcome to the SLIDE family
            </h2>
          </div>
        </FadeTransition>
      )}

      {step === "done" && (
        <div style={{ fontSize: 16, opacity: 0.7 }}>Redirecting…</div>
      )}
    </div>
  );
}
