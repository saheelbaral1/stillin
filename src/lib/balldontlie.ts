// src/lib/balldontlie.ts
//
// Thin, fully-typed wrapper around the football-data.org World Cup API.
//
// SERVER ONLY: this module reads `process.env.FOOTBALLDATA_API_KEY`, which is a
// secret (see Section 5 of STILLIN_MASTER.md). Never import this file from a
// client component — it would leak the key into the browser bundle.
//
// Per the master file: every API call has explicit error handling and a 10s
// timeout, and there are no `any` types anywhere.
//
// The public types (TeamRow, GroupStandings, Match) are stable — the rest of
// the app depends on them and they do not change when this API mapping changes.

const API_BASE = "https://api.football-data.org/v4";

// How long we wait before aborting any single request, in milliseconds.
// Required by the master file ("every API call must have a timeout").
const REQUEST_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Public types — these are the clean shapes the rest of the app consumes.
// ---------------------------------------------------------------------------

// One row of a group's standings table for a single team. These are exactly the
// fields the qualification logic (Section 4) needs to rank teams, including the
// two tie-breakers that are not raw goal stats: fairPlay and fifaRanking.
export type TeamRow = {
  team: string;       // Team display name, e.g. "Brazil"
  group: string;      // Group letter this team belongs to, e.g. "D"
  played: number;     // Matches played
  won: number;        // Matches won
  drawn: number;      // Matches drawn
  lost: number;       // Matches lost
  points: number;     // Competition points (win = 3, draw = 1)
  goalsFor: number;   // Goals scored
  goalsAgainst: number; // Goals conceded
  goalDiff: number;   // goalsFor - goalsAgainst
  fairPlay: number;   // Fair-play points (LOWER is better — see Section 4)
  fifaRanking: number; // Pre-tournament FIFA ranking (LOWER is better)
};

// A single group with its ordered list of team rows.
export type GroupStandings = {
  groupName: string; // e.g. "A"
  teams: TeamRow[];
};

// A live (or any) match. The only thing the cron job needs from this is whether
// any match is currently IN_PLAY so it can set is_live on the cache row.
export type Match = {
  id: number;
  status: string;    // e.g. "IN_PLAY", "FINISHED", "TIMED"
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
};

// ---------------------------------------------------------------------------
// Raw API shapes for football-data.org
// ---------------------------------------------------------------------------

// GET /competitions/WC/standings response
type RawTableEntry = {
  position?: number;
  team?: { id?: number; name?: string; crest?: string };
  playedGames?: number;
  won?: number;
  draw?: number;   // football-data.org uses "draw", not "drawn"
  lost?: number;
  points?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
};

type RawStandingGroup = {
  stage?: string;
  type?: string;   // "TOTAL" | "HOME" | "AWAY" — we only want "TOTAL"
  group?: string;  // e.g. "GROUP_A"
  table?: RawTableEntry[];
};

type RawStandingsResponse = {
  standings?: RawStandingGroup[];
};

// GET /competitions/WC/matches?status=IN_PLAY response
type RawMatchTeam = {
  id?: number;
  name?: string;
};

type RawScore = {
  fullTime?: { home?: number | null; away?: number | null };
};

type RawMatch = {
  id?: number;
  status?: string;
  homeTeam?: RawMatchTeam;
  awayTeam?: RawMatchTeam;
  score?: RawScore;
};

type RawMatchesResponse = {
  matches?: RawMatch[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

// Performs an authenticated GET against the football-data.org API with a hard
// timeout. Centralised here so both public functions share identical auth,
// timeout, and error-handling behaviour and we never duplicate the fetch logic.
// Throws a descriptive Error on missing key, timeout, or non-2xx response.
async function apiGet<T>(path: string): Promise<T> {
  const apiKey = process.env.FOOTBALLDATA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "FOOTBALLDATA_API_KEY is not set — cannot call the football-data.org API.",
    );
  }

  // AbortController gives us the required 10s timeout: if the request hangs,
  // we abort it rather than letting the cron job block forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: { "X-Auth-Token": apiKey },
      signal: controller.signal,
      // Always hit the network — this data changes every minute during matches,
      // so a stale cached fetch would defeat the whole point of the cron job.
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `football-data.org request to ${path} failed with HTTP ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    // Normalise an aborted fetch into a clear timeout message; re-wrap anything
    // else with the path so callers know exactly which request broke.
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `football-data.org request to ${path} timed out after ${REQUEST_TIMEOUT_MS}ms.`,
      );
    }
    if (error instanceof Error) {
      throw new Error(
        `football-data.org request to ${path} failed: ${error.message}`,
      );
    }
    throw new Error(
      `football-data.org request to ${path} failed with an unknown error.`,
    );
  } finally {
    // Always clear the timer so it can't fire after a successful response.
    clearTimeout(timeout);
  }
}

// Coerces a possibly-undefined or null number to a safe finite number.
// Null can appear in score fields (e.g. score.fullTime.home before KO).
function num(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// Extracts the single group letter from the football-data.org group string.
// "GROUP_A" → "A", "GROUP_B" → "B", etc.
// Falls back to the whole string if it doesn't match the expected pattern, so
// no group is silently dropped due to an unexpected format.
function groupLetter(raw: string | undefined): string {
  if (!raw) return "";
  const match = raw.match(/^GROUP_([A-Z]+)$/);
  return match ? match[1] : raw;
}

// Maps one raw table entry into our clean TeamRow.
// fairPlay is 0 because football-data.org does not provide fair-play points;
// fifaRanking is 99 as a safe placeholder — qualification.ts overwrites it with
// the real pre-tournament ranking from the hardcoded teams.ts list.
function toTeamRow(entry: RawTableEntry, group: string): TeamRow {
  return {
    team: entry.team?.name ?? "",
    group,
    played: num(entry.playedGames),
    won: num(entry.won),
    drawn: num(entry.draw),   // API field is "draw", our type uses "drawn"
    lost: num(entry.lost),
    points: num(entry.points),
    goalsFor: num(entry.goalsFor),
    goalsAgainst: num(entry.goalsAgainst),
    goalDiff: num(entry.goalDifference),
    fairPlay: 0,  // not provided by football-data.org
    fifaRanking: 99, // placeholder; overridden by teams.ts lookup in qualification.ts
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Fetches the current group standings for the World Cup and returns them as
// GroupStandings[], one entry per group letter (A–L).
//
// football-data.org returns three variants per group (TOTAL, HOME, AWAY); we
// only keep TOTAL since that is the one that matches official FIFA standings.
// The table array within each group is already sorted by position (1st → last),
// so we preserve that order — the qualification logic trusts standings order for
// head-to-head results that we cannot recompute from the raw data.
export async function fetchStandings(): Promise<GroupStandings[]> {
  const payload = await apiGet<RawStandingsResponse>("/competitions/WC/standings");
  const standingGroups = payload.standings ?? [];

  const result: GroupStandings[] = [];

  for (const sg of standingGroups) {
    // Skip HOME and AWAY views — we only want the overall (TOTAL) standings.
    if (sg.type !== "TOTAL") continue;

    const letter = groupLetter(sg.group);
    const teams = (sg.table ?? []).map((entry) => toTeamRow(entry, letter));

    if (letter && teams.length > 0) {
      result.push({ groupName: letter, teams });
    }
  }

  // Sort groups alphabetically (A, B, C, …) for stable, predictable output.
  return result.sort((a, b) => a.groupName.localeCompare(b.groupName));
}

// Shape of a viral post as stored in viral_cache and served by /api/viral.
// Exported so the cron route and the API route share one definition.
export type ViralPost = {
  emoji:    string;  // emoji assigned to the headline by Groq
  headline: string;  // first ~28 chars of the news title
  sub:      string;  // full news title up to 90 chars
  score?:   number;  // optional engagement count (news has none → undefined)
  url:      string;  // link to the source article
};

// Fetches matches currently in progress and returns them. The cron job uses
// this solely to set is_live = true on the cache row so the UI knows to expect
// fast-changing data. Returns an empty array when no match is live (the common
// case) — only throws for actual request failures, not for "nothing is live".
export async function fetchLiveMatches(): Promise<Match[]> {
  const payload = await apiGet<RawMatchesResponse>(
    "/competitions/WC/matches?status=IN_PLAY",
  );
  const matches = payload.matches ?? [];

  return matches
    .filter((m) => m.status === "IN_PLAY")
    .map((m) => ({
      id: num(m.id),
      status: m.status ?? "",
      homeTeam: m.homeTeam?.name ?? "",
      awayTeam: m.awayTeam?.name ?? "",
      homeScore: num(m.score?.fullTime?.home),
      awayScore: num(m.score?.fullTime?.away),
    }));
}
