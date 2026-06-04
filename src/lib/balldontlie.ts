// src/lib/balldontlie.ts
//
// Thin, fully-typed wrapper around the BallDontLie FIFA World Cup API.
//
// SERVER ONLY: this module reads `process.env.BALLDONTLIE_API_KEY`, which is a
// secret (see Section 5 of STILLIN_MASTER.md). Never import this file from a
// client component — it would leak the key into the browser bundle.
//
// Per the master file: every API call has explicit error handling and a 10s
// timeout, and there are no `any` types anywhere.
//
// NOTE / FLAG: STILLIN_MASTER.md specifies the *output* shapes we want
// (TeamRow, GroupStandings) but not the exact raw JSON the BallDontLie FIFA
// endpoints return. The `Raw*` interfaces below are a best-guess based on the
// standard BallDontLie `{ data: [...] }` envelope and should be verified
// against the live API. The public types we export are stable regardless of how
// the raw mapping changes.

const API_BASE = "https://api.balldontlie.io/fifa/worldcup/v1";

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
  team: string; // Team display name, e.g. "Brazil"
  group: string; // Group letter this team belongs to, e.g. "D"
  played: number; // Matches played
  won: number; // Matches won
  drawn: number; // Matches drawn
  lost: number; // Matches lost
  points: number; // Competition points (win = 3, draw = 1)
  goalsFor: number; // Goals scored
  goalsAgainst: number; // Goals conceded
  goalDiff: number; // goalsFor - goalsAgainst
  fairPlay: number; // Fair-play points (LOWER is better — see Section 4)
  fifaRanking: number; // Pre-tournament FIFA ranking (LOWER is better)
};

// A single group with its ordered list of team rows.
export type GroupStandings = {
  groupName: string; // e.g. "A"
  teams: TeamRow[];
};

// A live (or any) match returned by the /games endpoint. We keep this minimal:
// the only thing the product needs from /games is whether a match is currently
// in progress, so the cron job can mark the cache as "live".
export type Match = {
  id: number;
  status: string; // e.g. "in_progress", "final", "scheduled"
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
};

// ---------------------------------------------------------------------------
// Raw API shapes (best-guess — see FLAG note at top of file).
// ---------------------------------------------------------------------------

// The BallDontLie APIs wrap their payloads in a `data` array. We type the inner
// objects loosely-but-explicitly (optional fields, no `any`) so the mappers can
// defend against missing fields without crashing.
type RawStandingsRow = {
  team?: { name?: string; fifa_ranking?: number };
  team_name?: string;
  group?: string;
  group_name?: string;
  played?: number;
  games_played?: number;
  won?: number;
  wins?: number;
  drawn?: number;
  draws?: number;
  lost?: number;
  losses?: number;
  points?: number;
  goals_for?: number;
  goals_against?: number;
  goal_difference?: number;
  fair_play_points?: number;
  fifa_ranking?: number;
};

type RawStandingsResponse = {
  data?: RawStandingsRow[];
};

type RawMatch = {
  id?: number;
  status?: string;
  home_team?: { name?: string };
  away_team?: { name?: string };
  home_team_name?: string;
  away_team_name?: string;
  home_team_score?: number;
  away_team_score?: number;
};

type RawGamesResponse = {
  data?: RawMatch[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

// Performs an authenticated GET against the BallDontLie FIFA API with a hard
// timeout. Centralised here so both public functions share identical auth,
// timeout, and error-handling behaviour and we never duplicate the fetch logic.
// Throws a descriptive Error on missing key, timeout, or non-2xx response.
async function apiGet<T>(path: string): Promise<T> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BALLDONTLIE_API_KEY is not set — cannot call the BallDontLie FIFA API.",
    );
  }

  // AbortController gives us the required 10s timeout: if the request hangs,
  // we abort it rather than letting the cron job block forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: { Authorization: apiKey },
      signal: controller.signal,
      // Always hit the network — this data changes every minute during matches,
      // so a stale cached fetch would defeat the whole point of the cron job.
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `BallDontLie request to ${path} failed with HTTP ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    // Normalise an aborted fetch into a clear timeout message; re-wrap anything
    // else with the path so callers know exactly which request broke.
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `BallDontLie request to ${path} timed out after ${REQUEST_TIMEOUT_MS}ms.`,
      );
    }
    if (error instanceof Error) {
      throw new Error(`BallDontLie request to ${path} failed: ${error.message}`);
    }
    throw new Error(`BallDontLie request to ${path} failed with an unknown error.`);
  } finally {
    // Always clear the timer so it can't fire after a successful response.
    clearTimeout(timeout);
  }
}

// Coerces a possibly-undefined number into a safe number, defaulting to 0.
// Used so a missing field in the raw payload becomes 0 instead of NaN/undefined,
// keeping every TeamRow numeric field strictly a `number`.
function num(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// Maps one raw standings row into our clean TeamRow. Tolerates the two most
// likely field-naming conventions for each value (see FLAG note) and derives
// goalDiff if the API doesn't send it directly.
function toTeamRow(raw: RawStandingsRow): TeamRow {
  const goalsFor = num(raw.goals_for);
  const goalsAgainst = num(raw.goals_against);

  return {
    team: raw.team?.name ?? raw.team_name ?? "",
    group: raw.group ?? raw.group_name ?? "",
    played: num(raw.played ?? raw.games_played),
    won: num(raw.won ?? raw.wins),
    drawn: num(raw.drawn ?? raw.draws),
    lost: num(raw.lost ?? raw.losses),
    points: num(raw.points),
    goalsFor,
    goalsAgainst,
    goalDiff: num(raw.goal_difference ?? goalsFor - goalsAgainst),
    fairPlay: num(raw.fair_play_points),
    fifaRanking: num(raw.team?.fifa_ranking ?? raw.fifa_ranking),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Fetches the current group standings for all 12 World Cup groups and returns
// them grouped by group letter. We group here (rather than returning a flat
// list) because the qualification logic operates per-group, then cross-group
// only on the third-placed teams. Throws a descriptive error on any failure.
export async function fetchStandings(): Promise<GroupStandings[]> {
  const payload = await apiGet<RawStandingsResponse>("/group_standings");
  const rows = payload.data ?? [];

  // Bucket every team row by its group letter, preserving the API's order
  // within each group (the API returns rows already sorted by position).
  const byGroup = new Map<string, TeamRow[]>();
  for (const raw of rows) {
    const teamRow = toTeamRow(raw);
    const existing = byGroup.get(teamRow.group);
    if (existing) {
      existing.push(teamRow);
    } else {
      byGroup.set(teamRow.group, [teamRow]);
    }
  }

  // Emit groups in alphabetical order (A, B, C, ...) for stable, predictable
  // output regardless of the order the API listed them in.
  return [...byGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, teams]) => ({ groupName, teams }));
}

// Fetches all games and returns only those currently in progress. The cron job
// uses this to flag the standings cache as "live" so the UI can poll faster.
// Returns an empty array when no match is live (the common case), never throws
// for "no live games" — only for an actual request failure.
export async function fetchLiveMatches(): Promise<Match[]> {
  const payload = await apiGet<RawGamesResponse>("/games");
  const games = payload.data ?? [];

  return games
    .filter((game) => game.status === "in_progress")
    .map((game) => ({
      id: num(game.id),
      status: game.status ?? "",
      homeTeam: game.home_team?.name ?? game.home_team_name ?? "",
      awayTeam: game.away_team?.name ?? game.away_team_name ?? "",
      homeScore: num(game.home_team_score),
      awayScore: num(game.away_team_score),
    }));
}
