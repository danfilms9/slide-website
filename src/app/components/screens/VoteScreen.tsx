"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SlideButton } from "@/app/components/ui/SlideButton";
import { useExperienceStore, type VoteOption } from "@/app/lib/store";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMediaQuery } from "@/app/lib/hooks/useMediaQuery";
import { playOptionAudio, stopAudio } from "@/lib/audio";
import { submitVote, getUserVote, type VoteValue } from "@/lib/firestore";

const SCREEN_BG = "#e5e5e5";
const OPTION_BORDER = "rgba(0,0,0,0.15)";
const OPTION_BORDER_SELECTED = "rgba(0,0,0,0.5)";
const OPTION_BG = "rgba(0,0,0,0.04)";
const TEXT_COLOR = "#111";

export function VoteScreen() {
  const setScreen = useExperienceStore((s) => s.setScreen);
  const selectedVote = useExperienceStore((s) => s.selectedVote);
  const setVote = useExperienceStore((s) => s.setVote);

  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const playbackTriggeredByClick = useRef(false);

  const userId = user?.uid ?? null;
  const email = user?.email ?? "";

  // On mount: if user already voted, go to confirmation
  useEffect(() => {
    if (!userId) {
      setCheckingExisting(false);
      return;
    }
    let cancelled = false;
    getUserVote(userId)
      .then((existing) => {
        if (cancelled) return;
        setCheckingExisting(false);
        if (existing) {
          setVote(existing);
          setScreen("voteConfirm");
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, setScreen, setVote]);

  const handleOptionClick = useCallback((option: VoteOption) => {
    if (!option) return;
    setVote(option);
    stopAudio();
    playOptionAudio(option);
    playbackTriggeredByClick.current = true;
  }, [setVote]);

  const handleOptionMouseLeave = useCallback(() => {
    if (!playbackTriggeredByClick.current) stopAudio();
  }, []);

  const handleOptionMouseEnter = useCallback(
    (option: "option1" | "option2") => {
      if (isMobile) return;
      playbackTriggeredByClick.current = false;
      playOptionAudio(option);
    },
    [isMobile]
  );

  const handleSubmit = useCallback(async () => {
    if (!selectedVote || !userId || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await submitVote(userId, selectedVote as VoteValue, email);
      setScreen("voteConfirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  }, [selectedVote, userId, email, submitting, setScreen]);

  if (checkingExisting) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: SCREEN_BG,
          color: TEXT_COLOR,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <span style={{ fontSize: 16, opacity: 0.8 }}>Loading…</span>
      </div>
    );
  }

  const optionStyle = (
    option: "option1" | "option2"
  ): React.CSSProperties => ({
    flex: 1,
    minHeight: 0,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: selectedVote === option ? OPTION_BG : "transparent",
    border: `2px solid ${selectedVote === option ? OPTION_BORDER_SELECTED : OPTION_BORDER}`,
    borderRadius: 8,
    cursor: "pointer",
    color: TEXT_COLOR,
    fontSize: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
    boxShadow:
      selectedVote === option ? "0 0 20px rgba(0,0,0,0.06)" : "none",
    animation: selectedVote === option ? "vote-pulse 2s ease-in-out infinite" : "none",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: SCREEN_BG,
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes vote-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.06); }
          50% { box-shadow: 0 0 28px rgba(0,0,0,0.1); }
        }
      `}</style>

      {/* Top half: Option 1 — 100% height */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: 8,
          paddingBottom: 4,
        }}
        onMouseEnter={() => handleOptionMouseEnter("option1")}
        onMouseLeave={handleOptionMouseLeave}
        onClick={() => handleOptionClick("option1")}
        onTouchStart={() => {}}
        role="button"
        tabIndex={0}
        aria-pressed={selectedVote === "option1"}
        aria-label="Option 1"
      >
        <div style={optionStyle("option1")}>
          {isMobile && <span style={{ fontSize: 18, opacity: 0.9 }}>▶</span>}
          Option 1
        </div>
      </div>

      {/* Submit area */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 16px",
          gap: 8,
        }}
      >
        {error && (
          <span style={{ color: "#dc2626", fontSize: 13, textAlign: "center" }}>
            {error}
          </span>
        )}
        <SlideButton
          variant={selectedVote && !submitting ? "primary" : "disabled"}
          onClick={handleSubmit}
          disabled={!selectedVote || submitting}
        >
          {submitting ? "Submitting…" : "Submit Vote"}
        </SlideButton>
      </div>

      {/* Bottom half: Option 2 — 100% height */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: 8,
          paddingTop: 4,
        }}
        onMouseEnter={() => handleOptionMouseEnter("option2")}
        onMouseLeave={handleOptionMouseLeave}
        onClick={() => handleOptionClick("option2")}
        role="button"
        tabIndex={0}
        aria-pressed={selectedVote === "option2"}
        aria-label="Option 2"
      >
        <div style={optionStyle("option2")}>
          {isMobile && <span style={{ fontSize: 18, opacity: 0.9 }}>▶</span>}
          Option 2
        </div>
      </div>
    </div>
  );
}
