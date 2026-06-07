"use client";

import { useState, useRef, useEffect } from "react";
import { TEAMS } from "@/lib/teams";

const POPULAR_TEAM_NAMES = ["England", "Brazil", "Argentina", "France", "USA"];
const popularTeams = TEAMS.filter((t) => POPULAR_TEAM_NAMES.includes(t.name));

const FLAG_CODES: Record<string, string> = {
  England:   "gb-eng",
  Brazil:    "br",
  Argentina: "ar",
  France:    "fr",
  USA:       "us",
};

type Props = { onTeamSelect: (teamName: string) => void };

function BentoCard({
  team,
  onSelect,
  large = false,
}: {
  team: { name: string; flag: string };
  onSelect: (name: string) => void;
  large?: boolean;
}) {
  const code = FLAG_CODES[team.name];

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(500px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale(1.04)`;
    el.style.boxShadow = "var(--gold-glow-card)";
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)";
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <button
      onClick={() => onSelect(team.name)}
      className="bento-card"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        minHeight: large ? 160 : 90,
        padding: "12px 14px",
        background: "var(--pill-bg)",
        border: "1.5px solid var(--pill-border)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {code && (
        <img
          src={`https://flagcdn.com/w80/${code}.png`}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: large ? 72 : 48,
            height: "auto",
            opacity: 0.85,
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            pointerEvents: "none",
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: large ? 13 : 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--pill-text)",
        }}
      >
        {team.name}
      </span>
    </button>
  );
}

export default function TeamPicker({ onTeamSelect }: Props) {
  const [query,    setQuery]    = useState("");
  const [focused,  setFocused]  = useState(false);
  const [animText, setAnimText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelRef    = useRef(false);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shuffledRef  = useRef<string[]>([]);

  // Close dropdown on outside click.
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Typewriter animation — runs when input is idle (empty + unfocused).
  useEffect(() => {
    if (focused || query) {
      setAnimText("");
      return;
    }

    // Lazy-initialize on client only — avoids Math.random() running during SSR
    if (shuffledRef.current.length === 0) {
      shuffledRef.current = [...TEAMS.map((t) => t.name)].sort(() => Math.random() - 0.5);
    }
    const names = shuffledRef.current;

    cancelRef.current = false;
    let nameIdx  = 0;
    let charIdx  = 0;
    let deleting = false;

    function tick() {
      if (cancelRef.current) return;
      const name = names[nameIdx % names.length];

      if (!deleting) {
        charIdx++;
        setAnimText(name.slice(0, charIdx));
        if (charIdx === name.length) {
          deleting = true;
          timerRef.current = setTimeout(tick, 900);
        } else {
          timerRef.current = setTimeout(tick, 60);
        }
      } else {
        charIdx--;
        setAnimText(name.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          nameIdx++;
          timerRef.current = setTimeout(tick, 250);
        } else {
          timerRef.current = setTimeout(tick, 35);
        }
      }
    }

    timerRef.current = setTimeout(tick, 400);

    return () => {
      cancelRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      setAnimText("");
    };
  }, [focused, query]);

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? TEAMS.filter((t) => t.name.toLowerCase().includes(trimmed)).slice(0, 6)
    : [];
  const showDrop = focused && results.length > 0;

  function handleSelect(name: string) {
    onTeamSelect(name);
    setQuery("");
    setFocused(false);
  }

  const englandTeam  = popularTeams.find((t) => t.name === "England")!;
  const brazilTeam   = popularTeams.find((t) => t.name === "Brazil")!;
  const bottomTeams  = popularTeams.filter((t) => ["Argentina", "France", "USA"].includes(t.name));

  return (
    <div ref={containerRef}>

      {/* ── Search input ── */}
      <div className="relative w-full" style={{ height: 56 }}>
        <span
          style={{
            position: "absolute", left: 16, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--group-text)",
            display: "flex",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        {/* Typewriter overlay — visible only when input is idle */}
        {!focused && !query && animText && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 46,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 1,
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--input-ph)",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {animText}
          </span>
        )}

        <input
          className="search-input"
          type="text"
          role="combobox"
          aria-expanded={showDrop}
          aria-autocomplete="list"
          aria-label="Search for your team"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setFocused(true); }}
          onFocus={() => setFocused(true)}
          placeholder={focused || query ? "Search your team…" : ""}
          style={{
            width: "100%", height: "100%",
            paddingLeft: 46, paddingRight: 16,
            fontFamily: "var(--font-body)", fontSize: 16,
            color: "var(--input-text)",
            background: "var(--glass-bg)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: focused
              ? "1.5px solid var(--glass-border-focus)"
              : "1.5px solid var(--glass-border)",
            borderRadius: "var(--r-input)",
            outline: "none",
            boxShadow: focused ? "var(--gold-glow-ring)" : "none",
            transition: "border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)",
          }}
        />

        {/* ── Dropdown ── */}
        {showDrop && (
          <ul
            role="listbox"
            className="absolute top-full left-0 right-0 z-50 mt-1"
            style={{
              padding: 6, listStyle: "none",
              background: "var(--dropdown-bg)",
              border: "2px solid var(--input-border)",
              borderRadius: "var(--r-input)",
              boxShadow: "var(--shadow-pop)",
              overflow: "hidden",
            }}
          >
            {results.map((t) => (
              <li key={t.name} role="option" aria-selected={false}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(t.name); }}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 12px", textAlign: "left",
                    background: "transparent", border: "none",
                    borderRadius: 9, cursor: "pointer",
                    fontFamily: "var(--font-body)", fontSize: 15,
                    color: "var(--item-text)",
                    transition: "background var(--dur) var(--ease)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--item-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">{t.flag}</span>
                  <span style={{ flex: 1 }}>{t.name}</span>
                  <span style={{
                    fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11,
                    letterSpacing: "0.03em", color: "var(--group-text)",
                  }}>
                    GROUP {t.group}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Bento grid — top teams ── */}
      <p
        className="uppercase tracking-[0.12em] font-semibold font-body"
        style={{ fontSize: 11, color: "var(--group-text)", marginTop: 28, marginBottom: 12 }}
      >
        Most followed
      </p>

      {/* Row 1: England (tall) + Brazil — same row, England's minHeight drives row height */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 8 }}>
        <BentoCard team={englandTeam} onSelect={handleSelect} large />
        <BentoCard team={brazilTeam} onSelect={handleSelect} />
      </div>

      {/* Row 2: Argentina, France, USA */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
        {bottomTeams.map((t) => (
          <BentoCard key={t.name} team={t} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
