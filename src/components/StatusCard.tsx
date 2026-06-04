"use client";

import type { TeamStatus } from "@/lib/qualification";

// All class strings are spelled out in full so Tailwind's static scanner
// includes every arbitrary-value class in the build. Dynamic interpolation
// like `bg-[${color}]` would be purged.
const STATE_CONFIG = {
  THROUGH: {
    icon: "✅",
    label: "THROUGH",
    cardBg: "bg-[#DCFCE7]",
    borderColor: "border-[#BBF7D0]",
    textColor: "text-[#16A34A]",
    hexColor: "#16A34A",
  },
  HANGING_ON: {
    icon: "⚠️",
    label: "HANGING ON",
    cardBg: "bg-[#FEF3C7]",
    borderColor: "border-[#FDE68A]",
    textColor: "text-[#D97706]",
    hexColor: "#D97706",
  },
  IN_DANGER: {
    icon: "🔴",
    label: "IN DANGER",
    cardBg: "bg-[#FEE2E2]",
    borderColor: "border-[#FECACA]",
    textColor: "text-[#DC2626]",
    hexColor: "#DC2626",
  },
  OUT: {
    icon: "❌",
    label: "OUT",
    cardBg: "bg-[#F3F4F6]",
    borderColor: "border-[#E5E7EB]",
    textColor: "text-[#6B7280]",
    hexColor: "#6B7280",
  },
} as const;

type Props = {
  status: TeamStatus;
};

export default function StatusCard({ status }: Props) {
  const cfg = STATE_CONFIG[status.status];
  const showLiveDot =
    status.status === "HANGING_ON" || status.status === "IN_DANGER";

  return (
    <div
      className={`
        w-full max-w-[380px] mx-auto
        ${cfg.cardBg} ${cfg.borderColor}
        border-2 rounded-[20px]
        px-7 py-8
        flex flex-col items-center gap-3
      `}
    >
      {/* ── Flag ── */}
      <span
        className="leading-none select-none"
        style={{ fontSize: 44 }}
        aria-label={status.team}
      >
        {status.flag}
      </span>

      {/* ── Team name ── */}
      <p
        className="
          font-syne font-bold text-[13px] uppercase tracking-[0.1em]
          text-[#888888] text-center
        "
      >
        {status.team}
      </p>

      {/* ── Status icon + label ── */}
      <div className="flex flex-col items-center gap-1.5 mt-1">
        <span
          className="leading-none select-none"
          style={{ fontSize: 36 }}
          aria-hidden="true"
        >
          {cfg.icon}
        </span>
        <p
          className={`font-syne font-[800] text-[26px] leading-none tracking-[-0.02em] ${cfg.textColor}`}
        >
          {cfg.label}
        </p>
      </div>

      {/* ── Message ── */}
      <p className="font-dm-sans text-[15px] text-[#111111] text-center font-medium mt-1">
        {status.message}
      </p>

      {/* ── Detail ── */}
      {status.detail && (
        <p className="font-dm-sans text-[13px] text-[#444444] text-center">
          {status.detail}
        </p>
      )}

      {/* ── Live dot + timestamp row ── */}
      <div className="flex items-center justify-center gap-3 mt-2">
        {showLiveDot && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#16A34A] animate-live-pulse"
              aria-hidden="true"
            />
            <span className="font-dm-mono text-[11px] text-[#16A34A] font-medium">
              Live
            </span>
          </span>
        )}
        {/* TeamStatus has no real timestamp yet — show "Live data" as a placeholder
            until a fetchedAt field is added in a future build step. */}
        <span className="font-dm-mono text-[10px] text-[#888888]">
          Live data
        </span>
      </div>

      {/* ── Group position context ── */}
      <p className="font-dm-mono text-[11px] text-[#888888] text-center">
        {`Group ${status.group} · ${status.matchesPlayed} match${status.matchesPlayed === 1 ? "" : "es"} played`}
      </p>
    </div>
  );
}
