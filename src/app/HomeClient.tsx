"use client";

import { useState, useEffect } from "react";
import type { TeamStatus } from "@/lib/qualification";
import TeamPicker from "@/components/TeamPicker";
import { getTeamByName } from "@/lib/teams";
import StatusCard from "@/components/StatusCard";
import ShareButton from "@/components/ShareButton";
import NotifyCapture from "@/components/NotifyCapture";
import ExplainButton from "@/components/ExplainButton";
import ThemeToggle from "@/components/ThemeToggle";

type FetchState = "idle" | "loading" | "success" | "stale" | "error";

type ViralMoment = { emoji: string; headline: string; sub: string; url?: string };

// Static fallback shown until /api/viral returns live Reddit data.
const STATIC_MOMENTS: ViralMoment[] = [
  { emoji: "🪖", headline: "Norway's Vikings", sub: "Team photo in full viking gear went global" },
  { emoji: "✈️", headline: "Brazil blesses the jet", sub: "Players baptized the team plane before flying out" },
  { emoji: "🐐", headline: "Messi's last dance", sub: "Argentina captain confirmed this is his final World Cup" },
  { emoji: "🥁", headline: "Morocco's drummers", sub: "1,000-strong drum circle outside training camp" },
  { emoji: "🤖", headline: "Japan's AI kit", sub: "Adidas used generative AI to design the kit pattern" },
  { emoji: "🌊", headline: "NZ's haka moment", sub: "All Whites performed haka for the first time at a WC" },
  { emoji: "🦁", headline: "England roar back", sub: "Comeback vs Netherlands had fans re-watching the final 10 mins" },
  { emoji: "🎺", headline: "Vuvuzela returns", sub: "South Africa fans brought them back — FIFA said nothing" },
];

function ViralRow({ moment: m, last }: { moment: ViralMoment; last: boolean }) {
  return (
    <div
      onClick={() => m.url && window.open(m.url, "_blank", "noopener,noreferrer")}
      onMouseEnter={(e) => {
        if (m.url) (e.currentTarget as HTMLDivElement).style.background = "var(--item-hover-bg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "11px 8px",
        borderBottom: last ? "none" : "1px solid var(--divider)",
        cursor: m.url ? "pointer" : "default",
        borderRadius: 8,
        transition: "background var(--dur) var(--ease)",
      }}
    >
      {/* Emoji badge */}
      <div style={{
        width: 38, height: 38, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--pill-bg)",
        border: "1.5px solid var(--pill-border)",
        borderRadius: 10,
        fontSize: 19,
      }}>
        {m.emoji}
      </div>

      {/* Text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--font-body)", fontWeight: 600,
          fontSize: 13, lineHeight: 1.25,
          color: "var(--pill-text)", marginBottom: 2,
        }}>
          {m.headline}
        </p>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 12,
          color: "var(--group-text)", lineHeight: 1.35,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {m.sub}
        </p>
      </div>

      {/* Arrow — only on clickable rows */}
      {m.url && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="var(--group-text)" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" style={{ flexShrink: 0 }}>
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      )}
    </div>
  );
}

// The "still in?" wordmark: DM Mono 500, gold, always lowercase.
// The "?" gets gold-deep to create a subtle two-tone effect (per Wordmark.jsx).
function Wordmark() {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        fontSize: 19,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color: "var(--gold)",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      still in<span style={{ color: "var(--gold-deep)" }}>?</span>
    </span>
  );
}

export default function HomeClient() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamStatus, setTeamStatus]     = useState<TeamStatus | null>(null);
  const [fetchState, setFetchState]     = useState<FetchState>("idle");
  const [viralPosts, setViralPosts]     = useState<ViralMoment[]>(STATIC_MOMENTS);

  // On mount: check ?team= URL param + fetch live viral posts.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teamFromUrl = params.get("team");
    if (teamFromUrl) {
      handleTeamSelect(teamFromUrl);
    }

    // Replace static fallback with live Reddit posts from viral_cache.
    fetch("/api/viral")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          setViralPosts(data as ViralMoment[]);
        }
      })
      .catch(() => { /* keep static fallback silently */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch /api/status whenever selectedTeam changes. The route reads from
  // standings_cache — it never hits the football-data.org API directly.
  useEffect(() => {
    if (!selectedTeam) return;

    const controller = new AbortController();
    setFetchState("loading");
    setTeamStatus(null);

    fetch(`/api/status?team=${encodeURIComponent(selectedTeam)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 503) { setFetchState("stale");   return; }
        if (!res.ok)            { setFetchState("error");   return; }
        const data = (await res.json()) as TeamStatus;
        setTeamStatus(data);
        setFetchState("success");
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setFetchState("error");
      });

    return () => controller.abort();
  }, [selectedTeam]);

  function handleTeamSelect(name: string) {
    setSelectedTeam(name);
    setFetchState("idle");
    setTeamStatus(null);
  }

  function handleReset() {
    setSelectedTeam(null);
    setTeamStatus(null);
    setFetchState("idle");
  }

  // ── Screen 1 — Search ────────────────────────────────────────────────────
  if (!selectedTeam) {
    return (
      <div className="min-h-screen flex flex-col kinetic-bg" style={{ background: "var(--page-bg)" }}>
        <div className="flex-1 flex flex-col w-full max-w-[390px] mx-auto px-5">

          {/* chrome row — wordmark + theme toggle */}
          <div className="flex items-center justify-between h-16">
            <Wordmark />
            <ThemeToggle />
          </div>

          {/* heading block */}
          <div style={{ marginTop: 40 }}>
            <h1
              style={{
                fontFamily: "var(--font-kinetic)",
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: "clamp(50px, 13vw, 66px)",
                lineHeight: 0.90,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: "var(--heading)",
              }}
            >
              Which team<br />are you<br />following?
            </h1>
            <p
              style={{
                marginTop: 14,
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: 15,
                lineHeight: 1.4,
                color: "var(--subtitle)",
              }}
            >
              For people who are half-watching.
            </p>
          </div>

          {/* search + dropdown */}
          <div style={{ marginTop: 28 }}>
            <TeamPicker onTeamSelect={handleTeamSelect} />
          </div>

          {/* ── Viral moments — vertical list ── */}
          <div style={{ marginTop: 36 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--group-text)", marginBottom: 4,
              fontFamily: "var(--font-body)",
            }}>
              Around the tournament
            </p>
            <div>
              {viralPosts.map((m, i) => (
                <ViralRow
                  key={m.headline}
                  moment={m}
                  last={i === viralPosts.length - 1}
                />
              ))}
            </div>
          </div>

          {/* spacer pushes footer down */}
          <div className="flex-1" />

          {/* footer */}
          <p
            className="text-center py-6"
            style={{
              fontFamily: "var(--font-body)", fontWeight: 500,
              fontSize: 11, letterSpacing: "0.03em", color: "var(--footer-text)",
            }}
          >
            48 teams · 12 groups · updated live every 60s
          </p>
        </div>
      </div>
    );
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if (fetchState === "loading") {
    const team = getTeamByName(selectedTeam);
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--page-bg)" }}
      >
        {/* flag */}
        <span style={{ fontSize: 64, lineHeight: 1 }} aria-hidden="true">
          {team?.flag ?? ""}
        </span>

        {/* team name */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--loading-text)",
          }}
        >
          {selectedTeam}
        </p>

        {/* animated progress bar */}
        <div
          style={{
            width: 200, height: 3,
            background: "var(--progress-track)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "40%", height: "100%",
              background: "#C9A84C",
              borderRadius: 99,
              animation: "progress-slide 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    );
  }

  // ── Screen 2 — Status ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--page-bg)" }}>
      <div className="flex-1 flex flex-col w-full max-w-[390px] mx-auto px-5">

        {/* chrome row — back link | theme toggle + wordmark */}
        <div
          className="flex items-center justify-between"
          style={{ height: 64 }}
        >
          <button
            onClick={handleReset}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13,
              color: "var(--nav-text)",
              background: "none", border: "none", cursor: "pointer",
              padding: 0, marginLeft: -2,
            }}
          >
            {/* arrow-left icon — Lucide style */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Change team
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <Wordmark />
          </div>
        </div>

        {/* stale cache */}
        {fetchState === "stale" && (
          <p
            className="text-center py-12"
            style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--subtitle)" }}
          >
            Data loading — check back in a moment.
          </p>
        )}

        {/* error */}
        {fetchState === "error" && (
          <p
            className="text-center py-12"
            style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--danger-ink)" }}
          >
            Couldn&apos;t load status — please try again.
          </p>
        )}

        {/* ── success ── */}
        {fetchState === "success" && teamStatus && (
          <>
            {/* hero card */}
            <div style={{ marginTop: 8 }}>
              <StatusCard status={teamStatus} />
            </div>

            {/* share button */}
            <div style={{ marginTop: 16 }}>
              <ShareButton teamName={teamStatus.team} status={teamStatus.status} message={teamStatus.message} />
            </div>

            {/* AI explain */}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              <ExplainButton
                teamName={teamStatus.team}
                status={teamStatus.status}
                detail={teamStatus.detail}
              />
            </div>

            {/* notify — only for uncertain states */}
            {(teamStatus.status === "HANGING_ON" || teamStatus.status === "IN_DANGER") && (
              <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--divider)" }}>
                <NotifyCapture teamName={teamStatus.team} />
              </div>
            )}

            {/* spacer */}
            <div className="flex-1" style={{ minHeight: 16 }} />

            {/* footer */}
            <p
              className="text-center"
              style={{
                fontFamily: "var(--font-body)", fontWeight: 500,
                fontSize: 11, letterSpacing: "0.03em", color: "var(--footer-text)",
                padding: "16px 0 20px",
              }}
            >
              stillin.app · for people who are half-watching
            </p>
          </>
        )}
      </div>
    </div>
  );
}
