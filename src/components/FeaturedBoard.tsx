"use client";

// FeaturedBoard — the homepage "big names" status board.
//
// Replaces the old viral/news feed with something on-brand: the most-followed
// teams, each with its live THROUGH / HANGING ON / IN DANGER / OUT verdict.
// Reuses the qualification logic the app already computes (via /api/board, which
// wraps getTeamStatus) — no new external data. Each row taps straight into that
// team's full status card through the parent's existing handleTeamSelect flow.
//
// The team rows render immediately from the static TEAMS data so the section is
// never empty; the live status pills fill in once /api/board resolves.

import { useEffect, useState } from "react";
import type { TeamStatus } from "@/lib/qualification";
import { TEAMS, FEATURED_TEAMS, getTeamByName } from "@/lib/teams";

// Canonical card fills + labels, mirroring StatusCard.tsx (kept local by the
// same convention StatusCard uses, to avoid a shared-module refactor).
const FILLS: Record<TeamStatus["status"], string> = {
  THROUGH:    "#14532D",
  HANGING_ON: "#92400E",
  IN_DANGER:  "#7F1D1D",
  OUT:        "#1F2937",
};
const LABELS: Record<TeamStatus["status"], string> = {
  THROUGH:    "THROUGH",
  HANGING_ON: "HANGING ON",
  IN_DANGER:  "IN DANGER",
  OUT:        "OUT",
};

// Resolve any team name to its canonical TEAMS name (alias-aware), lower-cased,
// so statuses from the API line up with the featured names regardless of the
// exact spelling the standings feed used.
function canonical(name: string): string {
  return (getTeamByName(name)?.name ?? name).toLowerCase();
}

// The neutral pre-tournament sentinel, detected exactly as StatusCard does:
// HANGING_ON with no matches played yet. Reads as "waiting", not "warning".
function isPreTournament(s: TeamStatus): boolean {
  return s.status === "HANGING_ON" && s.matchesPlayed === 0;
}

// Small status pill on the right of each row.
function StatusPill({ status }: { status: TeamStatus | undefined }) {
  // Loading / not in standings yet → muted placeholder.
  if (!status) return <NeutralPill label="—" />;
  if (isPreTournament(status)) return <NeutralPill label="June 11" />;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: FILLS[status.status], color: "#FFFFFF",
      fontFamily: "var(--font-body)", fontWeight: 800,
      fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
      flexShrink: 0, whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: "rgba(255,255,255,0.85)", flexShrink: 0,
      }}/>
      {LABELS[status.status]}
    </span>
  );
}

function NeutralPill({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: "var(--pill-bg)", border: "1px solid var(--pill-border)",
      color: "var(--group-text)",
      fontFamily: "var(--font-body)", fontWeight: 700,
      fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
      flexShrink: 0, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

export default function FeaturedBoard({
  onTeamSelect,
}: {
  onTeamSelect: (name: string) => void;
}) {
  // Live statuses keyed by canonical team name; empty until /api/board resolves.
  const [statuses, setStatuses] = useState<Record<string, TeamStatus>>({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/board")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        const map: Record<string, TeamStatus> = {};
        for (const s of data as TeamStatus[]) map[canonical(s.team)] = s;
        setStatuses(map);
      })
      .catch(() => { /* keep static rows, no pills */ });
    return () => { cancelled = true; };
  }, []);

  // Static row data (flag + name) from TEAMS so the section renders instantly.
  const rows = FEATURED_TEAMS
    .map((name) => getTeamByName(name))
    .filter((t): t is (typeof TEAMS)[number] => Boolean(t));

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <p style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--group-text)",
          fontFamily: "var(--font-body)",
        }}>
          The big names
        </p>
        {/* Live dot */}
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--gold)", flexShrink: 0,
        }}/>
      </div>

      <div>
        {rows.map((team, i) => {
          const status = statuses[team.name.toLowerCase()];
          const last = i === rows.length - 1;
          return (
            <div
              key={team.name}
              onClick={() => onTeamSelect(team.name)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--item-hover-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 8px",
                borderBottom: last ? "none" : "1px solid var(--divider)",
                cursor: "pointer", borderRadius: 8,
                transition: "background var(--dur) var(--ease)",
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>
                {team.flag}
              </span>
              <p style={{
                flex: 1, minWidth: 0,
                fontFamily: "var(--font-body)", fontWeight: 600,
                fontSize: 14, color: "var(--pill-text)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {team.name}
              </p>
              <StatusPill status={status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
