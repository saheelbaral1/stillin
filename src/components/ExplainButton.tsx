"use client";

import { useState } from "react";

type Props = {
  teamName: string;
  status: string;
  detail: string; // reserved — available for richer context in the future
};

type UIState = "idle" | "loading" | "success" | "error";

// The Gemini prompt (Section 10) ends every explanation with "RELAX" or
// "NERVOUS" on its own line. This splits that verdict off from the body so it
// can be styled independently — the one-word verdict is the emotional payoff of
// the whole feature, so it deserves its own treatment.
function parseExplanation(raw: string): { body: string; verdict: "RELAX" | "NERVOUS" | null } {
  const lines = raw.trim().split("\n");
  const last = lines[lines.length - 1].trim().toUpperCase();
  if (last === "RELAX" || last === "NERVOUS") {
    return { body: lines.slice(0, -1).join("\n").trim(), verdict: last };
  }
  return { body: raw.trim(), verdict: null };
}

export default function ExplainButton({ teamName, status }: Props) {
  const [uiState, setUiState] = useState<UIState>("idle");
  const [body, setBody] = useState("");
  const [verdict, setVerdict] = useState<"RELAX" | "NERVOUS" | null>(null);

  async function handleClick() {
    if (uiState === "success") return; // already showing — don't re-fetch

    setUiState("loading");
    try {
      const url = `/api/explain?team=${encodeURIComponent(teamName)}&status=${encodeURIComponent(status)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Non-OK response from explain API");
      }
      const data = (await res.json()) as { explanation?: string };
      if (!data.explanation) {
        throw new Error("Empty explanation returned");
      }
      const parsed = parseExplanation(data.explanation);
      setBody(parsed.body);
      setVerdict(parsed.verdict);
      setUiState("success");
    } catch {
      setUiState("error");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Trigger button — text-only style, no background */}
      {uiState !== "success" && (
        <button
          onClick={handleClick}
          disabled={uiState === "loading"}
          className="
            font-dm-sans text-[13px] text-[#888888]
            underline underline-offset-2
            bg-transparent disabled:opacity-60
          "
        >
          {uiState === "loading" ? (
            <em>Thinking…</em>
          ) : uiState === "error" ? (
            "Couldn't load explanation — try again"
          ) : (
            "Wait, what does this mean?"
          )}
        </button>
      )}

      {/* Explanation box — only shown on success */}
      {uiState === "success" && (
        <div
          className="
            w-full bg-white border border-[#E0DEDA] rounded-[10px]
            px-[14px] py-3
            font-dm-sans text-[14px] text-[#444444]
          "
        >
          {/* Body text — the actual explanation */}
          <p className="leading-relaxed">{body}</p>

          {/* Verdict — RELAX (green) or NERVOUS (amber), Syne 700 */}
          {verdict && (
            <p
              className={`
                mt-2 font-syne font-bold text-[16px] tracking-wide
                ${verdict === "RELAX" ? "text-[#16A34A]" : "text-[#D97706]"}
              `}
            >
              {verdict}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
