"use client";

export function VoteScreen() {
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
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, textAlign: "center" }}>
        Your vote
      </h1>
      <p style={{ fontSize: 14, opacity: 0.7, marginTop: 8, textAlign: "center" }}>
        Vote screen — placeholder for Phase 6+
      </p>
    </div>
  );
}
