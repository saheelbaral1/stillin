"use client";

import { useState } from "react";

type Props = {
  teamName: string;
};

type UIState = "idle" | "loading" | "success" | "error";

export default function NotifyCapture({ teamName }: Props) {
  const [email, setEmail] = useState("");
  const [uiState, setUiState] = useState<UIState>("idle");
  const [dismissed, setDismissed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // "No thanks" hides the whole component — user has signalled they don't want
  // notifications, so showing it again would be annoying.
  if (dismissed) return null;

  if (uiState === "success") {
    return (
      <p className="font-dm-sans text-[13px] text-[#444444] text-center py-2">
        You&apos;re on the list! We&apos;ll email you when it&apos;s decided.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setUiState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), team: teamName }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Something went wrong");
      }

      setUiState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setUiState("error");
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Label */}
      <p className="font-dm-sans text-[12px] text-[#888888] text-center">
        Notify me the moment it&apos;s decided
      </p>

      {/* Input + button row */}
      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={uiState === "loading"}
          className="
            flex-1 h-12 px-3
            font-dm-sans text-[13px] text-[#111111] placeholder:text-[#888888]
            bg-white border-[1.5px] border-[#E0DEDA] rounded-[10px]
            outline-none focus:border-[#111111]
            transition-colors disabled:opacity-60
          "
        />
        <button
          type="submit"
          disabled={uiState === "loading" || !email.trim()}
          className="
            h-12 px-4 shrink-0 rounded-[12px]
            bg-[#111111] text-white
            font-dm-sans font-medium text-[13px]
            transition-opacity disabled:opacity-50
          "
        >
          {uiState === "loading" ? "…" : "Notify me"}
        </button>
      </form>

      {/* Error message */}
      {uiState === "error" && errorMsg && (
        <p className="font-dm-sans text-[12px] text-[#DC2626] text-center">
          {errorMsg}
        </p>
      )}

      {/* No thanks */}
      <button
        onClick={() => setDismissed(true)}
        className="
          font-dm-sans text-[12px] text-[#888888]
          underline underline-offset-2
          bg-transparent mt-0.5
        "
      >
        No thanks
      </button>
    </div>
  );
}
