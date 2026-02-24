"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useExperienceStore } from "@/app/lib/store";

export function VotePageUserMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if ((pathname !== "/vote" && pathname !== "/dashboard") || !user) return null;

  const displayLabel = user.displayName ?? "Logged in";

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 20,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 24,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            width={28}
            height={28}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              background: "#e5e5e5",
            }}
          />
        ) : (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#6366f1",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ fontSize: 13, color: "#333", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayLabel}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            minWidth: 140,
            background: "rgba(255,255,255,0.98)",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => {
              useExperienceStore.getState().setScreen("intro");
              useExperienceStore.getState().setPreviousScreen(null);
              signOut();
              setOpen(false);
              router.replace("/");
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 14px",
              fontSize: 14,
              color: "#333",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
