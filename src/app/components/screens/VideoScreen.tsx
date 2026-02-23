"use client";

import { useState, useEffect, useCallback } from "react";
import { FadeTransition } from "@/app/components/ui/FadeTransition";
import { SlideButton } from "@/app/components/ui/SlideButton";
import { useExperienceStore } from "@/app/lib/store";

const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";
const SUBSCRIBE_URL =
  "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw?sub_confirmation=1";

const WELCOME_DURATION_MS = 600;
const LOADING_DURATION_MS = 2000;
const FADE_MS = 400;
const SUBSCRIBE_DELAY_MS = 10000;
const CONTINUE_DELAY_MS = 10000;

function LoadingWheel() {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        border: "2px solid rgba(0,0,0,0.1)",
        borderTopColor: "#333",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

export function VideoScreen() {
  const setScreen = useExperienceStore((s) => s.setScreen);

  const [showWelcome, setShowWelcome] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  // After a short moment, show loading wheel + "loading video"
  useEffect(() => {
    const t = setTimeout(() => setShowLoading(true), WELCOME_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  // After welcome + loading duration, fade out message and show video
  useEffect(() => {
    const total = WELCOME_DURATION_MS + LOADING_DURATION_MS;
    const t = setTimeout(() => {
      setShowWelcome(false);
      setShowLoading(false);
      setShowVideo(true);
    }, total);
    return () => clearTimeout(t);
  }, []);

  // 10s after video is visible, show subscribe button
  useEffect(() => {
    if (!showVideo) return;
    const t = setTimeout(() => setShowSubscribe(true), SUBSCRIBE_DELAY_MS);
    return () => clearTimeout(t);
  }, [showVideo]);

  // 10s after subscribe is visible, show continue button
  useEffect(() => {
    if (!showSubscribe) return;
    const t = setTimeout(() => setShowContinue(true), CONTINUE_DELAY_MS);
    return () => clearTimeout(t);
  }, [showSubscribe]);

  const handleSubscribe = useCallback(() => {
    if (typeof window !== "undefined") {
      window.open(SUBSCRIBE_URL, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleContinue = useCallback(() => {
    setScreen("votePrompt");
  }, [setScreen]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: 24,
    boxSizing: "border-box",
    background: "#e5e5e5",
  };

  return (
    <div style={containerStyle}>
      {/* Global keyframes for spinner - inject once */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Phase 1 & 2: Welcome (centered, fades in) + loading (below, fades in without moving welcome) */}
      <FadeTransition
        show={showWelcome}
        duration={FADE_MS}
        onComplete={undefined}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 24,
            background: "#e5e5e5",
          }}
        >
          {/* Welcome message: fixed center, fades in */}
          <FadeTransition show={true} duration={FADE_MS} fadeInOnMount>
            <h2
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 22,
                fontWeight: 600,
                margin: 0,
                textAlign: "center",
                width: "100%",
              }}
            >
              Welcome to the SLIDE family
            </h2>
          </FadeTransition>

          {/* Loading wheel + text: below center, fades in without affecting welcome position */}
          {showLoading && (
            <FadeTransition show duration={350} fadeInOnMount>
              <div
                style={{
                  position: "absolute",
                  top: "56%",
                  left: "50%",
                  transform: "translate(-50%, 0)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <LoadingWheel />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#6b7280",
                  }}
                >
                  loading video
                </span>
              </div>
            </FadeTransition>
          )}
        </div>
      </FadeTransition>

      {/* Phase 3: Video (centered), then subscribe and continue with delays */}
      <FadeTransition show={showVideo} duration={FADE_MS} fadeInOnMount>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 320,
              height: 180,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
          >
            <iframe
              width="320"
              height="180"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
              title="YouTube video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{
                border: "none",
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          {showSubscribe && (
            <FadeTransition show duration={FADE_MS} fadeInOnMount>
              <div style={{ marginTop: 16 }}>
                <SlideButton
                  variant="primary"
                  onClick={handleSubscribe}
                  className="!rounded-[14px] !px-3 !py-1.5 !text-xs"
                >
                  Subscribe
                </SlideButton>
              </div>
            </FadeTransition>
          )}

          {showContinue && (
            <FadeTransition show duration={FADE_MS} fadeInOnMount>
              <button
                type="button"
                onClick={handleContinue}
                style={{
                  marginTop: 12,
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#333",
                  cursor: "pointer",
                  textDecoration: "underline",
                  opacity: 0.9,
                }}
                className="hover:opacity-100 transition-opacity"
              >
                Continue →
              </button>
            </FadeTransition>
          )}
        </div>
      </FadeTransition>
    </div>
  );
}
