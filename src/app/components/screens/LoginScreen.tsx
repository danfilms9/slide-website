"use client";

import { useState } from "react";
import { useExperienceStore } from "@/app/lib/store";
import { signInWithGoogle } from "@/lib/auth";

function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 6.168-2.172l-2.908-2.258c-.806.54-1.837.86-3.26.86-2.513 0-4.646-1.696-5.424-4.171H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.576 10.711c-.18-.54-.282-1.117-.282-1.711 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l2.619-2.331z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.414 0 2.683.486 3.711 1.297l2.783-2.783C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.576 7.29C4.354 4.814 6.487 3.118 9 3.118z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginScreen() {
  const setLoggedIn = useExperienceStore((s) => s.setLoggedIn);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setLoggedIn(true);
        // Use window.location so navigation works when rendered inside R3F Html portal (router context may be unavailable)
        window.location.href = "/vote";
        return;
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
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
      <p style={{ fontSize: 20, fontWeight: 600, margin: 0, marginBottom: 24, textAlign: "center" }}>
        Log in to count your vote
      </p>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "12px 20px",
          fontSize: 16,
          fontWeight: 500,
          color: "#111",
          backgroundColor: "#fff",
          border: "2px solid #333",
          borderRadius: 24,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <GoogleGIcon />
        Log in with Google
      </button>

      {error && (
        <p style={{ fontSize: 13, color: "#b91c1c", marginTop: 12, textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}
