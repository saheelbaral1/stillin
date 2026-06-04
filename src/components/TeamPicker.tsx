"use client";

import { useState, useRef, useEffect } from "react";
import { TEAMS } from "@/lib/teams";

// Five teams shown as quick-pick pills below the search input. Chosen because
// they are the most-searched nations and give the picker immediate utility
// without typing.
const POPULAR_TEAM_NAMES = ["England", "Brazil", "Argentina", "France", "USA"];
const popularTeams = TEAMS.filter((t) => POPULAR_TEAM_NAMES.includes(t.name));

type Props = {
  onTeamSelect: (teamName: string) => void;
};

export default function TeamPicker({ onTeamSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click — standard pattern for accessible comboboxes.
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const trimmed = query.trim();
  const results = trimmed
    ? TEAMS.filter((t) =>
        t.name.toLowerCase().includes(trimmed.toLowerCase()),
      ).slice(0, 6)
    : [];

  function handleSelect(name: string) {
    onTeamSelect(name);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">

      {/* ── Search input ── */}
      <div className="relative" style={{ height: 56 }}>
        {/* Magnifier icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-autocomplete="list"
          aria-label="Search for your team"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search your team…"
          className="
            w-full h-full pl-11 pr-4
            font-dm-sans text-[15px] text-[#111111] placeholder:text-[#888888]
            bg-white border-2 border-[#E0DEDA] rounded-[14px]
            outline-none focus:border-[#111111]
            transition-colors
          "
        />
      </div>

      {/* ── Dropdown results ── */}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="
            absolute left-0 right-0 top-[60px] z-10
            bg-white border-2 border-[#E0DEDA] rounded-[14px]
            overflow-hidden shadow-sm
          "
        >
          {results.map((team) => (
            <li key={team.name} role="option" aria-selected={false}>
              <button
                // onMouseDown fires before onBlur, keeping the input focused
                // and preventing the outside-click handler from closing first.
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(team.name);
                }}
                className="
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  font-dm-sans text-[14px] text-[#111111]
                  hover:bg-[#F5F4F0] transition-colors
                "
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {team.flag}
                </span>
                <span>{team.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Popular team pills ── */}
      <div className="flex flex-wrap gap-2 mt-4">
        {popularTeams.map((team) => (
          <button
            key={team.name}
            onClick={() => handleSelect(team.name)}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              bg-white border border-[#E0DEDA] rounded-full
              font-dm-sans text-[13px] text-[#444444]
              hover:border-[#111111] hover:text-[#111111]
              transition-colors
            "
          >
            <span aria-hidden="true">{team.flag}</span>
            <span>{team.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
