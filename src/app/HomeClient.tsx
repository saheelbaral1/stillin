"use client";

// HomeClient owns all the interactive state for the single-page app.
// It is imported by the server component page.tsx, which has no runtime JS
// of its own — this is where all client behaviour lives.

import { useState, useEffect } from "react";
import type { TeamStatus } from "@/lib/qualification";
import TeamPicker from "@/components/TeamPicker";
import StatusCard from "@/components/StatusCard";
import ShareButton from "@/components/ShareButton";
import NotifyCapture from "@/components/NotifyCapture";
import ExplainButton from "@/components/ExplainButton";

type FetchState = "idle" | "loading" | "success" | "stale" | "error";

export default function HomeClient() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamStatus, setTeamStatus] = useState<TeamStatus | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>("idle");

  // Fetch from /api/status whenever selectedTeam changes. The route reads from
  // the standings_cache table — it never calls BallDontLie directly — so this
  // is fast and safe to call on every team selection.
  useEffect(() => {
    if (!selectedTeam) return;

    const controller = new AbortController();
    setFetchState("loading");
    setTeamStatus(null);

    fetch(`/api/status?team=${encodeURIComponent(selectedTeam)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        // 503 means the cron job hasn't populated the cache yet — tell the
        // user to check back rather than showing a cryptic error.
        if (res.status === 503) {
          setFetchState("stale");
          return;
        }
        if (!res.ok) {
          setFetchState("error");
          return;
        }
        const data = (await res.json()) as TeamStatus;
        setTeamStatus(data);
        setFetchState("success");
      })
      .catch((err: unknown) => {
        // AbortError is expected when the component unmounts or selectedTeam
        // changes before the previous fetch completes — not a real error.
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

  return (
    // Outer wrapper: full-height page with #F5F4F0 background (set on <html>
    // in layout.tsx) and centred column at max-width 480px.
    <div className="relative min-h-screen flex flex-col">

      {/* ── Wordmark — fixed top-left, outside the centred column ── */}
      <div className="fixed top-0 left-0 pt-5 pl-5 z-10 pointer-events-none">
        <span className="font-dm-mono font-medium text-[13px] text-[#888888]">
          still in?
        </span>
      </div>

      {/* ── Centred content column ── */}
      <main
        className="
          flex-1 flex flex-col items-center justify-center
          w-full max-w-[480px] mx-auto
          px-5
          pt-16 pb-12
        "
      >
        {/* ── Picker view: no team selected ── */}
        {!selectedTeam && (
          <div className="w-full flex flex-col">
            <h1
              className="
                font-syne font-[800] tracking-[-0.02em] text-[#111111]
                text-[28px] sm:text-[32px]
                mb-1.5
              "
            >
              Which team are you following?
            </h1>
            <p className="font-dm-sans text-[13px] text-[#888888] mb-6">
              Find out if they&apos;re still in the World Cup — right now.
            </p>
            <TeamPicker onTeamSelect={handleTeamSelect} />
          </div>
        )}

        {/* ── Status view: team selected ── */}
        {selectedTeam && (
          <div className="w-full flex flex-col items-center">

            {/* Back link */}
            <button
              onClick={handleReset}
              className="
                self-start mb-5
                font-dm-sans text-[13px] text-[#888888]
                hover:text-[#111111] transition-colors
              "
            >
              ← Change team
            </button>

            {/* Loading */}
            {fetchState === "loading" && (
              <p className="font-dm-sans text-[14px] text-[#888888] text-center py-8">
                Loading…
              </p>
            )}

            {/* Cache not populated yet */}
            {fetchState === "stale" && (
              <p className="font-dm-sans text-[14px] text-[#888888] text-center py-8">
                Data loading, check back in a moment.
              </p>
            )}

            {/* Unexpected error */}
            {fetchState === "error" && (
              <p className="font-dm-sans text-[14px] text-[#DC2626] text-center py-8">
                Couldn&apos;t load status — please try again.
              </p>
            )}

            {/* Success: status card + action components */}
            {fetchState === "success" && teamStatus && (
              <div className="w-full flex flex-col items-center">

                {/* StatusCard */}
                <StatusCard status={teamStatus} />

                {/* Gap: card → buttons = 20px */}
                <div className="mt-5 w-full flex flex-col" style={{ gap: 16 }}>

                  {/* ExplainButton sits closest to the card — it explains the status */}
                  <ExplainButton
                    teamName={teamStatus.team}
                    status={teamStatus.status}
                    detail={teamStatus.detail}
                  />

                  {/* ShareButton */}
                  <ShareButton
                    teamName={teamStatus.team}
                    status={teamStatus.status}
                  />

                  {/* Gap: buttons → email = 16px (already set by the parent gap) */}
                  {/* NotifyCapture — only relevant for uncertain states */}
                  {(teamStatus.status === "HANGING_ON" ||
                    teamStatus.status === "IN_DANGER") && (
                    <NotifyCapture teamName={teamStatus.team} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
