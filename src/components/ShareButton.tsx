"use client";

import { useState } from "react";

type Props = {
  teamName: string;
  status: string; // reserved for future OG-image URL construction
};

export default function ShareButton({ teamName }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `https://stillin.app/?team=${encodeURIComponent(teamName)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Revert label after 2 seconds — long enough to read, short enough to
      // not feel broken if the user wants to share again.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard.writeText can fail if the page doesn't have focus (e.g. in
      // an iframe) — fail silently rather than crashing the UI.
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={copied}
      className="
        w-full h-12 rounded-[12px]
        bg-[#111111] text-white
        font-dm-sans font-medium text-[14px]
        transition-opacity
        disabled:opacity-80
      "
    >
      {copied ? "✅ Copied!" : "📤 Share this"}
    </button>
  );
}
