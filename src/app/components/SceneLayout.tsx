"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { VotePageUserMenu } from "@/app/components/VotePageUserMenu";

const Scene = dynamic(
  () =>
    import("@/app/components/three/Scene").then((mod) => ({ default: mod.Scene })),
  { ssr: false }
);

export function SceneLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVotePage = pathname === "/vote";

  return (
    <AuthProvider>
      <main className="fixed inset-0 w-full h-full overflow-hidden">
        <Scene isVotePage={isVotePage} />
      </main>
      <VotePageUserMenu />
      {children}
    </AuthProvider>
  );
}
