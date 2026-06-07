"use client";

import { useState } from "react";

type Props = { teamName: string };
type UIState = "idle" | "loading" | "success" | "error";

export default function NotifyCapture({ teamName }: Props) {
  const [email,    setEmail]    = useState("");
  const [uiState,  setUiState]  = useState<UIState>("idle");
  const [dismissed,setDismissed]= useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (dismissed) return null;

  if (uiState === "success") {
    return (
      <p style={{
        textAlign: "center",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        fontFamily: "var(--font-body)", fontSize: 14, color: "var(--explain-text)",
      }}>
        {/* check icon */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="var(--through-ink)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        You&apos;re on the list — we&apos;ll email you the moment it&apos;s decided.
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
    <div>
      {/* label with bell icon */}
      <p style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--subtitle)",
        marginBottom: 10,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        Notify me the moment it&apos;s decided
      </p>

      {/* input + button */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={uiState === "loading"}
          style={{
            flex: 1, height: 48, padding: "0 14px",
            fontFamily: "var(--font-body)", fontSize: 14,
            color: "var(--input-text)",
            background: "var(--input-bg)",
            border: "1.5px solid var(--input-border)",
            borderRadius: 11,
            outline: "none",
            transition: "border-color var(--dur) var(--ease)",
          }}
          onFocus={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "var(--input-focus)"; }}
          onBlur={(e)   => { (e.currentTarget as HTMLInputElement).style.borderColor = "var(--input-border)"; }}
        />
        <button
          type="submit"
          disabled={uiState === "loading" || !email.trim()}
          style={{
            height: 48, padding: "0 18px", flexShrink: 0,
            background: "var(--btn-bg)", color: "var(--btn-text)",
            border: "none", borderRadius: 12, cursor: "pointer",
            fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
            whiteSpace: "nowrap",
            opacity: uiState === "loading" || !email.trim() ? 0.5 : 1,
            transition: "opacity var(--dur) var(--ease)",
          }}
        >
          {uiState === "loading" ? "…" : "Notify me"}
        </button>
      </form>

      {/* error */}
      {uiState === "error" && errorMsg && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--danger-ink)", textAlign: "center", marginTop: 8 }}>
          {errorMsg}
        </p>
      )}

      {/* no thanks */}
      <p style={{ textAlign: "center", marginTop: 12 }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13,
            color: "var(--subtitle)",
          }}
        >
          No thanks
        </button>
      </p>
    </div>
  );
}
