"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/app/lib/store";

/**
 * Subscribes to the experience store and handles side effects of screen changes.
 * Currently manages currentScreen state; will later handle route changes for /vote and /dashboard.
 */
export function useExperienceFlow() {
  const currentScreen = useExperienceStore((s) => s.currentScreen);

  useEffect(() => {
    // Side effects when screen changes (e.g. future: sync route, analytics)
    switch (currentScreen) {
      case "intro":
        break;
      case "video":
        break;
      case "vote":
      case "votePrompt":
      case "voteConfirm":
        // Future: navigate to /vote when applicable
        break;
      case "dashboard":
        // Future: navigate to /dashboard
        break;
      default:
        break;
    }
  }, [currentScreen]);

  return { currentScreen };
}
