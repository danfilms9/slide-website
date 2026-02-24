"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExperienceStore } from "@/app/lib/store";
import { useAuth } from "@/lib/hooks/useAuth";

export default function VotePage() {
  const router = useRouter();
  const setScreen = useExperienceStore((s) => s.setScreen);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    setScreen("vote");
  }, [user, loading, router, setScreen]);

  return null;
}
