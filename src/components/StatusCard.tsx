"use client";

import type { TeamStatus } from "@/lib/qualification";

// ── Canonical fills (per the approved design system) ────────────────────────
const FILLS: Record<TeamStatus["status"], string> = {
  THROUGH:    "#14532D",
  HANGING_ON: "#92400E",
  IN_DANGER:  "#7F1D1D",
  OUT:        "#1F2937",
};

// Labels exactly as they appear on the scoreboard card.
const LABELS: Record<TeamStatus["status"], string> = {
  THROUGH:    "THROUGH",
  HANGING_ON: "HANGING ON",
  IN_DANGER:  "IN DANGER",
  OUT:        "OUT",
};

// ── Live pill ────────────────────────────────────────────────────────────────
// Shown only on HANGING ON / IN DANGER to signal the data is live-updated.
// Two-layer dot: outer ring expands and fades (live-ring); inner dot pulses
// (live-dot). Both driven by CSS keyframes in globals.css.
function LivePill() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 10px 5px 9px",
        borderRadius: "var(--r-pill)",
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <span style={{ position: "relative", width: 8, height: 8, display: "inline-flex" }}>
        {/* expanding ring */}
        <span
          className="live-ring"
          style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            background: "var(--on-fill)",
          }}
        />
        {/* solid inner dot */}
        <span
          className="live-dot"
          style={{
            position: "relative", width: 8, height: 8,
            borderRadius: "50%",
            background: "var(--on-fill)",
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500, fontSize: 10.5,
          letterSpacing: "0.18em",
          color: "var(--on-fill)",
        }}
      >
        LIVE
      </span>
    </span>
  );
}

// ── Qualify meter ────────────────────────────────────────────────────────────
// 12 horizontal cells representing the 12 third-placed teams. Shown only when
// the team has a cross-group rank (HANGING_ON / IN_DANGER). Gold pip marks the
// team's current rank; white cut-line after cell 8 is the qualification boundary.
function QualifyMeter({ rank }: { rank: number }) {
  function suffix(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] ?? s[v] ?? s[0];
  }

  return (
    <div style={{ width: "100%", marginTop: 18, position: "relative", zIndex: 1 }}>
      {/* cells */}
      <div style={{ display: "flex", gap: 3, marginBottom: 9 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i + 1;
          const isTeam = n === rank;
          const inZone = n <= 8;
          return (
            <div key={n} style={{ flex: 1, position: "relative" }}>
              <div
                style={{
                  height: 8,
                  borderRadius: 2,
                  background: isTeam
                    ? "var(--gold)"
                    : inZone
                    ? "rgba(255,255,255,0.34)"
                    : "rgba(255,255,255,0.13)",
                  boxShadow: isTeam ? "0 0 0 2px rgba(0,0,0,0.18)" : "none",
                }}
              />
              {/* white cut-line at the 8/12 boundary */}
              {n === 8 && (
                <span
                  style={{
                    position: "absolute", right: -3,
                    top: -4, bottom: -4,
                    width: 2, background: "rgba(255,255,255,0.92)",
                    borderRadius: 2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-body)", fontSize: 10.5,
            letterSpacing: "0.04em", color: "var(--on-fill)",
          }}
        >
          {rank}{suffix(rank)} of 12 third-placed
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)", fontSize: 10.5,
            letterSpacing: "0.04em", color: "var(--on-fill-dim)",
          }}
        >
          top 8 qualify
        </span>
      </div>
    </div>
  );
}

// ── StatusCard ───────────────────────────────────────────────────────────────
type Props = { status: TeamStatus };

export default function StatusCard({ status }: Props) {
  // The pre-tournament sentinel: HANGING_ON with no matches played yet.
  // Reuses the HANGING_ON card fill but suppresses live pulse and qualify meter.
  const isPreTournament =
    status.status === "HANGING_ON" &&
    status.message === "Tournament hasn't started yet";

  // Pre-tournament uses a dark neutral fill (#1C1917) with a solid gold border
  // rather than the amber HANGING_ON fill, so it reads as "waiting" not "warning".
  const fill   = isPreTournament ? "#1C1917" : FILLS[status.status];
  const border = isPreTournament
    ? "1px solid var(--gold)"
    : "1px solid rgba(201,168,76,0.4)";
  const label = isPreTournament ? "JUNE 11" : LABELS[status.status];
  // Multi-word labels (HANGING ON, IN DANGER) split across two lines.
  // All labels use 86px so the scoreboard text bleeds nearly edge-to-edge.
  const labelWords  = label.split(" ");
  const isMultiWord = labelWords.length > 1;
  const labelSize   = 86;
  const showLive    = !isPreTournament && (status.status === "HANGING_ON" || status.status === "IN_DANGER");
  const showMeter   = !isPreTournament && status.thirdPlaceRank !== null;

  return (
    <div
      style={{
        borderRadius: "var(--r-card)",
        border,
        boxShadow: "var(--shadow-hero)",
        background: fill,
        padding: "20px 22px 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Flag watermark — large faded flag centred behind the status label.
          Placed first in DOM so it sits below the depth gradient and all content. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 200,
          lineHeight: 1,
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        {status.flag}
      </div>

      {/* Depth gradient — transparent → dark at foot, makes on-fill type pop */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.20) 100%)",
        }}
      />

      {/* ── Top row: group context + live pill ── */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--on-fill-dim)",
          }}
        >
          {status.group} · {status.matchesPlayed} PLAYED
        </span>
        {showLive && <LivePill />}
      </div>

      {/* ── Flag + team name — broadcast header row ── */}
      <div
        style={{
          position: "relative", zIndex: 1, marginTop: 18,
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span
          style={{ fontSize: 28, lineHeight: 1 }}
          aria-label={status.team}
        >
          {status.flag}
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12.5,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--on-fill)",
          }}
        >
          {status.team}
        </span>
      </div>

      {/* ── Status label — the dominant element on screen ── */}
      <div style={{ position: "relative", zIndex: 1, marginTop: 14, textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: labelSize,
            lineHeight: 0.82,
            letterSpacing: "-0.02em",
            color: "var(--on-fill)",
            textShadow: "0 2px 0 rgba(0,0,0,0.12)",
            margin: 0,
          }}
        >
          {isMultiWord
            ? labelWords.map((w, i) => <div key={i}>{w}</div>)
            : label}
        </h2>
      </div>

      {/* ── Message ── */}
      <p
        style={{
          position: "relative", zIndex: 1, marginTop: 18, textAlign: "center",
          fontFamily: "var(--font-body)", fontWeight: 500,
          fontSize: 15.5, lineHeight: 1.4,
          color: "var(--on-fill)",
        }}
      >
        {status.message}
      </p>

      {/* ── Qualify meter (3rd-place) or detail line ── */}
      {showMeter && status.thirdPlaceRank !== null ? (
        <QualifyMeter rank={status.thirdPlaceRank} />
      ) : (
        <p
          style={{
            position: "relative", zIndex: 1, marginTop: 12, textAlign: "center",
            fontFamily: "var(--font-body)", fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--on-fill-dim)",
          }}
        >
          {status.detail}
        </p>
      )}
    </div>
  );
}
