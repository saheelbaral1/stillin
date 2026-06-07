"use client";

import { useState } from "react";

type Props = {
  teamName: string;
  status: string;
};

export default function ShareButton({ teamName }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `https://stillin.vercel.app/?team=${encodeURIComponent(teamName)}&status=${status}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can fail without page focus — fail silently.
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        height: 52, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        background: copied ? "var(--through-fill)" : "var(--gold)",
        color: copied ? "#fff" : "#1A1306",
        border: "none",
        borderRadius: "var(--r-btn)",
        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15.5,
        boxShadow: "var(--shadow-card)",
        cursor: "pointer",
        transition: "filter var(--dur) var(--ease), background var(--dur) var(--ease)",
      }}
      onMouseEnter={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
      onMouseDown={(e)  => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
      onMouseUp={(e)    => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";   }}
    >
      {copied ? (
        // check icon
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        // share / upload icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      )}
      {copied ? "Link copied" : "Share this result"}
    </button>
  );
}
