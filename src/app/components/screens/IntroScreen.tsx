"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FadeTransition } from "@/app/components/ui/FadeTransition";
import { HeightThenOpacityTransition } from "@/app/components/ui/HeightThenOpacityTransition";
import { SlideButton } from "@/app/components/ui/SlideButton";
import { useExperienceStore, type IntroStep, type IntroNoFlow } from "@/app/lib/store";

const TITLE_FADE_MS = 1000;
const SUBTEXT1_DELAY_MS = 3500;
const SUBTEXT1_VISIBLE_MS = 3000;
const SUBTEXT1_FADEOUT_MS = 500;
const PAUSE_BEFORE_SUBTEXT2_MS = 500;
const SUBTEXT2_TO_BUTTONS_MS = 400;
const MAYBE_NEXT_TO_SECOND_MS = 3000;

export function IntroScreen() {
  const setScreen = useExperienceStore((s) => s.setScreen);
  const storeIntroStep = useExperienceStore((s) => s.introStep);
  const storeIntroNoFlow = useExperienceStore((s) => s.introNoFlow);
  const setIntroStep = useExperienceStore((s) => s.setIntroStep);
  const setIntroNoFlow = useExperienceStore((s) => s.setIntroNoFlow);

  const [step, setStep] = useState<IntroStep>(0);
  const [noFlow, setNoFlow] = useState<IntroNoFlow>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtext1, setShowSubtext1] = useState(false);
  const [showSubtext2, setShowSubtext2] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const hasSyncedFromStore = useRef(false);

  // On mount: restore from store so remounts don't reset to "SLIDE" only
  useEffect(() => {
    if (hasSyncedFromStore.current) return;
    hasSyncedFromStore.current = true;
    const s = storeIntroStep;
    const n = storeIntroNoFlow;
    if (s > 0 || n !== null) {
      setStep(s);
      setNoFlow(n);
      setShowTitle(true);
      setShowSubtext1(s >= 1 && s < 2);
      setShowSubtext2(s >= 3 || n !== null);
      setShowButtons(s >= 3 || n === "second");
    }
  }, [storeIntroStep, storeIntroNoFlow]);

  const setStepAndStore = useCallback(
    (next: IntroStep) => {
      setStep(next);
      setIntroStep(next);
    },
    [setIntroStep]
  );

  const setNoFlowAndStore = useCallback(
    (next: IntroNoFlow) => {
      setNoFlow(next);
      setIntroNoFlow(next);
    },
    [setIntroNoFlow]
  );

  // Step 0 → 1: show title, then after delay show subtext1 (skip if already past)
  useEffect(() => {
    if (storeIntroStep > 0) return;
    setShowTitle(true);
    const t1 = setTimeout(() => setStepAndStore(1), SUBTEXT1_DELAY_MS);
    return () => clearTimeout(t1);
  }, [storeIntroStep, setStepAndStore]);

  // Step 1: show first subtext; only schedule transition to 2 when exactly at step 1
  useEffect(() => {
    if (step < 1) return;
    setShowSubtext1(true);
    if (step !== 1) return;
    const t2 = setTimeout(() => setStepAndStore(2), SUBTEXT1_VISIBLE_MS);
    return () => clearTimeout(t2);
  }, [step, setStepAndStore]);

  // Step 2: hide subtext1, then after pause go to step 3; only when exactly at step 2
  useEffect(() => {
    if (step < 2) return;
    setShowSubtext1(false);
    if (step !== 2) return;
    const totalWait = SUBTEXT1_FADEOUT_MS + PAUSE_BEFORE_SUBTEXT2_MS;
    const t3 = setTimeout(() => setStepAndStore(3), totalWait);
    return () => clearTimeout(t3);
  }, [step, setStepAndStore]);

  // Step 3: show subtext2, then buttons; only when exactly at step 3
  useEffect(() => {
    if (step < 3) return;
    setShowSubtext2(true);
    if (step !== 3) return;
    const t4 = setTimeout(() => setShowButtons(true), SUBTEXT2_TO_BUTTONS_MS);
    return () => clearTimeout(t4);
  }, [step]);

  const handleYes = useCallback(() => {
    setScreen("video");
    if (typeof window !== "undefined") console.log("[IntroScreen] yes → video");
  }, [setScreen]);

  const handleNo = useCallback(() => setNoFlowAndStore("maybe"), [setNoFlowAndStore]);

  useEffect(() => {
    if (noFlow !== "maybe") return;
    const t = setTimeout(() => setNoFlowAndStore("second"), MAYBE_NEXT_TO_SECOND_MS);
    return () => clearTimeout(t);
  }, [noFlow, setNoFlowAndStore]);

  const promptContent =
    noFlow === "maybe"
      ? "Maybe next time..."
      : noFlow === "second"
        ? "Changed your mind?"
        : "Want to hear the first release before anyone else?";

  const showYesNoButtons = step >= 3 && showButtons && noFlow !== "maybe";
  const showYesOnly = noFlow === "second";

  const subtextParagraphStyle = {
    fontSize: 14,
    fontWeight: 300,
    maxWidth: 280,
    lineHeight: 1.6,
    textAlign: "center" as const,
    margin: 0,
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
      <FadeTransition show={showTitle} duration={TITLE_FADE_MS} delay={0}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: 8,
            marginBottom: 32,
          }}
        >
          SLIDE
        </div>
      </FadeTransition>

      <HeightThenOpacityTransition
        show={step >= 1}
        heightDuration={640}
        opacityDuration={600}
        maxHeight="90px"
        parallel
        className="mt-0 min-w-0"
      >
        <div style={{ minHeight: 56 }}>
          {step <= 2 && (
            <FadeTransition show={step === 1} fadeInOnMount duration={350}>
              <p style={subtextParagraphStyle}>
                SLIDE is an experiment in music and live experience
              </p>
            </FadeTransition>
          )}
          {(step >= 3 || noFlow !== null) && (
            <FadeTransition key={promptContent} show fadeInOnMount duration={350}>
              <p style={subtextParagraphStyle}>{promptContent}</p>
            </FadeTransition>
          )}
        </div>
      </HeightThenOpacityTransition>

      {/* Buttons container: always reserves height so nothing shifts when buttons fade in */}
      <div
        className="mt-6 min-w-0"
        style={{
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FadeTransition
          show={showYesNoButtons || showYesOnly}
          duration={600}
          fadeInOnMount
        >
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
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
      </div>
    </div>
  );
}
