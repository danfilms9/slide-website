"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SlideButton } from "@/app/components/ui/SlideButton";
import { useExperienceStore, type VoteOption } from "@/app/lib/store";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/authStore";
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
  const previousScreen = useExperienceStore((s) => s.previousScreen);
  const setPreviousScreen = useExperienceStore((s) => s.setPreviousScreen);
  const existingVoteFromDashboard = useExperienceStore((s) => s.existingVoteFromDashboard);
  const setExistingVoteFromDashboard = useExperienceStore((s) => s.setExistingVoteFromDashboard);
  const selectedVote = useExperienceStore((s) => s.selectedVote);
  const setVote = useExperienceStore((s) => s.setVote);
  const showBackToDashboard = previousScreen === "dashboard";

  const auth = useAuth();
  const { user, loading: authLoading } = auth;
  // Auth store is synced by AuthContext; use it so we get auth inside R3F Canvas (context doesn't propagate there)
  const authUserId = useAuthStore((s) => s.userId);
  const authEmail = useAuthStore((s) => s.email);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(
    () => existingVoteFromDashboard === null
  );
  const playbackTriggeredByClick = useRef(false);

  const userId = authUserId ?? user?.uid ?? null;
  const email = (authEmail || user?.email) ?? "";

  // Diagnostic: log auth state (context vs store) to confirm store is used inside Canvas
  useEffect(() => {
    console.log("[VoteScreen] auth state", {
      fromContext: { hasUser: !!user, userId: user?.uid ?? null, authLoading },
      fromStore: { userId: authUserId, email: authEmail },
      resolved: { userId, email },
    });
  }, [user, authLoading, authUserId, authEmail, userId, email]);

  // On mount: if user already voted, go to confirmation (skip when opened from dashboard with existing vote)
  const CHECK_EXISTING_TIMEOUT_MS = 4000;
  useEffect(() => {
    if (!userId || existingVoteFromDashboard !== null) {
      if (existingVoteFromDashboard !== null) setCheckingExisting(false);
      else if (!userId) setCheckingExisting(false);
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setCheckingExisting(false);
    }, CHECK_EXISTING_TIMEOUT_MS);
    getUserVote(userId)
      .then((existing) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setCheckingExisting(false);
        if (existing) {
          setVote(existing);
          setScreen("voteConfirm");
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setCheckingExisting(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [userId, existingVoteFromDashboard, setScreen, setVote]);

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

  const handleSubmit = useCallback(
    async (e?: React.MouseEvent<HTMLButtonElement>) => {
      e?.stopPropagation();
      e?.preventDefault();

      if (!selectedVote) {
        setError("Please select an option first.");
        return;
      }
      if (!userId) {
        setError("You must be logged in to vote.");
        return;
      }
      if (submitting) return;

      // From dashboard, same choice = "Keep vote" → just return to dashboard
      if (existingVoteFromDashboard !== null && selectedVote === existingVoteFromDashboard) {
        setExistingVoteFromDashboard(null);
        setPreviousScreen(null);
        setScreen("dashboard");
        return;
      }

      setError(null);
      setSubmitting(true);
      const SUBMIT_TIMEOUT_MS = 15000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Submission timed out. Please try again.")), SUBMIT_TIMEOUT_MS);
      });
      try {
        await Promise.race([
          submitVote(userId, selectedVote as VoteValue, email),
          timeoutPromise,
        ]);
        setExistingVoteFromDashboard(null);
        setScreen("voteConfirm");
      } catch (err) {
        console.error("[VoteScreen] submitVote failed", err);
        setError(err instanceof Error ? err.message : "Failed to submit vote");
      } finally {
        setSubmitting(false);
      }
    },
    [
      selectedVote,
      userId,
      email,
      submitting,
      setScreen,
      setPreviousScreen,
      existingVoteFromDashboard,
      setExistingVoteFromDashboard,
    ]
  );

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

  const handleBackToDashboard = useCallback(() => {
    setExistingVoteFromDashboard(null);
    setPreviousScreen(null);
    setScreen("dashboard");
  }, [setScreen, setPreviousScreen, setExistingVoteFromDashboard]);

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
      {showBackToDashboard && (
        <button
          type="button"
          onClick={handleBackToDashboard}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 10,
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "#333",
            cursor: "pointer",
          }}
          className="hover:opacity-80 transition-opacity"
        >
          ← Back
        </button>
      )}
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

      {/* Submit area — ensure it receives pointer events and doesn't let clicks bubble to option handlers */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 16px",
          gap: 8,
          position: "relative",
          zIndex: 1,
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {error && (
          <span style={{ color: "#dc2626", fontSize: 13, textAlign: "center" }}>
            {error}
          </span>
        )}
        <SlideButton
          variant={selectedVote && !submitting ? "primary" : "disabled"}
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit(e);
          }}
          disabled={submitting}
        >
          {submitting
            ? "Submitting…"
            : existingVoteFromDashboard !== null
              ? selectedVote === existingVoteFromDashboard
                ? "Keep vote"
                : "Change Vote"
              : "Submit Vote"}
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
