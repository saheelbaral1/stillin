"use client";

import { useState } from "react";

type Props = {
  teamName: string;
  status: string;
  detail: string;
};

type UIState = "idle" | "loading" | "success" | "error";

// The Section 10 prompt always ends with "RELAX" or "NERVOUS" on its own line.
// Split it off for independent styling — the one-word verdict is the
// emotional payoff and gets the Saira Condensed display face.
function parseExplanation(raw: string): { body: string; verdict: "RELAX" | "NERVOUS" | null } {
  const lines = raw.trim().split("\n");
  const last  = lines[lines.length - 1].trim().toUpperCase();
  if (last === "RELAX" || last === "NERVOUS") {
    return { body: lines.slice(0, -1).join("\n").trim(), verdict: last };
  }
  return { body: raw.trim(), verdict: null };
}

export default function ExplainButton({ teamName, status }: Props) {
  const [uiState, setUiState] = useState<UIState>("idle");
  const [body,    setBody]    = useState("");
  const [verdict, setVerdict] = useState<"RELAX" | "NERVOUS" | null>(null);

  async function handleClick() {
    if (uiState === "success") return;

    setUiState("loading");
    try {
      const url = `/api/explain?team=${encodeURIComponent(teamName)}&status=${encodeURIComponent(status)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Non-OK response");
      const data = (await res.json()) as { explanation?: string };
      if (!data.explanation) throw new Error("Empty response");
      const parsed = parseExplanation(data.explanation);
      setBody(parsed.body);
      setVerdict(parsed.verdict);
      setUiState("success");
    } catch {
      setUiState("error");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* Trigger link — always visible; gold→purple gradient is the approved AI
          content signal. Shows loading/error states inline. Hidden only once
          the explanation is showing AND the user has no reason to re-trigger. */}
      <button
        onClick={handleClick}
        disabled={uiState === "loading" || uiState === "success"}
        style={{
          background: "none", border: "none", cursor: uiState === "success" ? "default" : "pointer", padding: 0,
          display: "inline-flex", alignItems: "center", gap: 6,
          backgroundImage: "linear-gradient(90deg, #C9A84C 0%, #9B6FD4 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5,
          opacity: uiState === "loading" ? 0.6 : 1,
        } as React.CSSProperties}
      >
        <span aria-hidden="true">✦</span>
        {uiState === "loading" ? "Thinking…" : uiState === "error"
          ? "Couldn't load — try again"
          : "Wait, what does this mean?"}
      </button>

      {/* Explanation box — appears below the trigger after a successful fetch */}
      {uiState === "success" && (
        <div
          style={{
            width: "100%",
            background: "var(--explain-bg)",
            border: "1.5px solid var(--explain-border)",
            borderRadius: 12,
            padding: "14px 15px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p style={{
            fontFamily: "var(--font-body)", fontWeight: 400,
            fontSize: 14, lineHeight: 1.55,
            color: "var(--explain-text)",
          }}>
            {body}
          </p>
          {verdict && (
            <p style={{
              marginTop: 10,
              fontFamily: "var(--font-display)", fontWeight: 900,
              fontSize: 22, letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: verdict === "RELAX" ? "var(--through-ink)" : "var(--danger-ink)",
            }}>
              {verdict}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
