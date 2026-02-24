"use client";

import { useState, useCallback, useEffect } from "react";
import { SlideButton } from "@/app/components/ui/SlideButton";
import { useExperienceStore } from "@/app/lib/store";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/authStore";
import { getUserVote } from "@/lib/firestore";

const SCREEN_BG = "#e5e5e5";
const TEXT_COLOR = "#111";

const BUTTON_GAP = 16;

export function DashboardScreen() {
  const setScreen = useExperienceStore((s) => s.setScreen);
  const setPreviousScreen = useExperienceStore((s) => s.setPreviousScreen);
  const setVote = useExperienceStore((s) => s.setVote);
  const setExistingVoteFromDashboard = useExperienceStore((s) => s.setExistingVoteFromDashboard);

  const { user } = useAuth();
  const authUserId = useAuthStore((s) => s.userId);
  const userId = authUserId ?? user?.uid ?? null;

  const [voteCheckLoading, setVoteCheckLoading] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState(false);

  const handleWatchSmoke = useCallback(() => {
    setPreviousScreen("dashboard");
    setScreen("video");
  }, [setScreen, setPreviousScreen]);

  const handleVoteClick = useCallback(async () => {
    if (!userId) return;
    setVoteCheckLoading(true);
    try {
      const existing = await getUserVote(userId);
      setVote(existing ?? null);
      if (existing) {
        setExistingVoteFromDashboard(existing);
      } else {
        setExistingVoteFromDashboard(null);
      }
      setPreviousScreen("dashboard");
      setScreen("vote");
    } catch {
      setPreviousScreen("dashboard");
      setScreen("vote");
      setExistingVoteFromDashboard(null);
    } finally {
      setVoteCheckLoading(false);
    }
  }, [userId, setScreen, setPreviousScreen, setVote, setExistingVoteFromDashboard]);

  const handleInteract = useCallback(() => {
    setComingSoonToast(true);
  }, []);

  useEffect(() => {
    if (!comingSoonToast) return;
    const t = setTimeout(() => setComingSoonToast(false), 2500);
    return () => clearTimeout(t);
  }, [comingSoonToast]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: SCREEN_BG,
        color: TEXT_COLOR,
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* Coming soon toast */}
      {comingSoonToast && (
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: 13,
            padding: "10px 16px",
            borderRadius: 8,
            zIndex: 10,
          }}
        >
          This feature is coming soon. Stay tuned.
        </div>
      )}

      {/* Stack of 3 buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: BUTTON_GAP,
        }}
      >
        <SlideButton variant="primary" onClick={handleWatchSmoke}>
          Watch SMOKE
        </SlideButton>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <SlideButton
            variant="primary"
            onClick={handleVoteClick}
            disabled={voteCheckLoading}
          >
            {voteCheckLoading ? "Loading…" : "Vote on Song 2"}
          </SlideButton>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={handleInteract}
            className="rounded-[24px] px-7 py-2.5 text-base font-medium cursor-pointer border border-gray-500 bg-transparent text-gray-500 hover:opacity-90 transition-opacity active:scale-[0.97]"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            Interact
          </button>
          <span style={{ fontSize: 10, opacity: 0.4 }}>Coming soon</span>
        </div>
      </div>
    </div>
  );
}
