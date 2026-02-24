"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/app/lib/store";

export default function Home() {
  const setScreen = useExperienceStore((s) => s.setScreen);
  const setPreviousScreen = useExperienceStore((s) => s.setPreviousScreen);

  useEffect(() => {
    setScreen("intro");
    setPreviousScreen(null);
  }, [setScreen, setPreviousScreen]);

  return null;
}
