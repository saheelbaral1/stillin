"use client";

import { useState, useRef, useEffect } from "react";
import { TEAMS } from "@/lib/teams";

const POPULAR_TEAM_NAMES = ["England", "Brazil", "Argentina", "France", "USA"];
const popularTeams = TEAMS.filter((t) => POPULAR_TEAM_NAMES.includes(t.name));

type Props = { onTeamSelect: (teamName: string) => void };

export default function TeamPicker({ onTeamSelect }: Props) {
  const [query,   setQuery]   = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef}>

      {/* ── Search input ── */}
      <div className="relative w-full" style={{ height: 56 }}>
        {/* search icon */}
        <span
          style={{
            position: "absolute", left: 16, top: "50%",
            transform: "translateY(-50%)",
            color: "#444444",
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
        <input
          className="search-input-dark"
          type="text"
          role="combobox"
          aria-expanded={showDrop}
          aria-autocomplete="list"
          aria-label="Search for your team"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setFocused(true); }}
          onFocus={() => setFocused(true)}
          placeholder="Search your team…"
          style={{
            width: "100%", height: "100%",
            paddingLeft: 46, paddingRight: 16,
            fontFamily: "var(--font-body)", fontSize: 16,
            color: "#FFFFFF",
            background: "#111111",
            border: focused ? "2px solid #C9A84C" : "2px solid #222222",
            borderRadius: "var(--r-input)",
            outline: "none",
            boxShadow: "none",
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
              background: "#111111",
              border: "2px solid #222222",
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
                    color: "#FFFFFF",
                    transition: "background var(--dur) var(--ease)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">{t.flag}</span>
                  <span style={{ flex: 1 }}>{t.name}</span>
                  <span style={{
                    fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11,
                    letterSpacing: "0.03em", color: "#444444",
                  }}>
                    GROUP {t.group}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Popular pills ── */}
      <p
        className="uppercase tracking-[0.12em] font-semibold font-body"
        style={{ fontSize: 11, color: "#444444", marginTop: 28, marginBottom: 12 }}
      >
        Most followed
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {popularTeams.map((t) => (
          <button
            key={t.name}
            onClick={() => handleSelect(t.name)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 14px",
              background: "#111111",
              border: "1.5px solid #222222",
              borderRadius: "var(--r-pill)",
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
              color: "#888888",
              cursor: "pointer",
              transition: "all var(--dur) var(--ease)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "#C9A84C";
              el.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "#222222";
              el.style.color = "#888888";
            }}
          >
            <span style={{ fontSize: 17, lineHeight: 1 }} aria-hidden="true">{t.flag}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
