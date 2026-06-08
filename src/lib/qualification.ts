// src/lib/qualification.ts
//
// THE CORE OF THE PRODUCT. This file decides whether a team is still in the
// World Cup. Per STILLIN_MASTER.md Section 4, it must be written carefully and
// never modified without explicit approval.
//
// The FIFA WC 2026 format (Section 2 & 4):
//   - 12 groups (A–L), 4 teams each.
//   - Top 2 of every group qualify automatically -> 24 teams.
//   - The 12 third-placed teams are ranked CROSS-GROUP; the best 8 also
//     qualify -> 8 teams. Total Round of 32 = 32 teams.
//   - Third-place ranking tie-breakers, in order:
//       1. Points
//       2. Goal difference
//       3. Goals scored
//       4. Fair-play points (LOWER is better)
//       5. FIFA ranking (LOWER is better, sourced from the hardcoded teams list)
//
// The four states (Section 3): THROUGH, HANGING_ON, IN_DANGER, OUT.
//
// No `any` types. Every function is documented with what it does and why.

import type { GroupStandings, TeamRow } from "./balldontlie";
import type { Team } from "./teams";

// Name aliases: maps from the API / common name to the canonical name stored in
// teams.ts. Applied to BOTH sides of every comparison (see normTeamName below)
// so "Turkey" in standings data and "Türkiye" in teams.ts both resolve to the
// same canonical string, and vice versa.
const TEAM_ALIASES: Record<string, string> = {
  turkey:         "türkiye",
  iran:           "ir iran",
  "ivory coast":  "côte d'ivoire",
  "cape verde":   "cabo verde",
  "dr congo":     "congo dr",
};

// Normalises a team name for comparison: lower-cases it and resolves any known
// alias so both sides of a match end up in the same canonical form. This is the
// single point where API name drift is absorbed — every name comparison in this
// file routes through here rather than doing its own toLowerCase().
function normTeamName(name: string): string {
  const lower = name.trim().toLowerCase();
  return TEAM_ALIASES[lower] ?? lower;
}

// Each team plays exactly 3 group-stage matches. Used to compute how many games
// a team still has left, which drives the mathematical-elimination check.
const GROUP_STAGE_MATCHES = 3;

// Only the best 8 of the 12 third-placed teams go through. A third-placed team
// ranked at or above this line is HANGING_ON; below it is IN_DANGER.
const THIRD_PLACE_QUALIFYING_SPOTS = 8;

// The full status of a single team — everything the UI needs to render a status
// card, and everything the cron job needs to detect a status change.
export type TeamStatus = {
  team: string; // Canonical team name (as it appears in the standings)
  flag: string; // Emoji flag, sourced from the hardcoded teams list
  group: string; // Group letter A–L
  groupPosition: number; // 1–4: position within their own group
  thirdPlaceRank: number | null; // Cross-group rank among 3rd-placed teams, or null if not 3rd
  status: "THROUGH" | "HANGING_ON" | "IN_DANGER" | "OUT";
  message: string; // Plain-English headline, e.g. "Top of Group E — already qualified"
  detail: string; // One line of extra context, e.g. "Currently 7th-best 3rd place team"
  canStillQualify: boolean; // false only when mathematically eliminated
  matchesPlayed: number; // Group-stage matches this team has played so far
};

// ---------------------------------------------------------------------------
// Small lookup helpers (sourced from the hardcoded `allTeams` list)
// ---------------------------------------------------------------------------

// Returns the pre-tournament FIFA ranking for a team name, case-insensitively.
// FIFA ranking is the final third-place tie-breaker (lower is better) and is
// NOT part of the live standings payload, so it must come from `allTeams`. Falls
// back to a very large number so an unknown team sorts last rather than first.
function fifaRankingOf(teamName: string, allTeams: Team[]): number {
  const target = normTeamName(teamName);
  const match = allTeams.find((t) => normTeamName(t.name) === target);
  return match ? match.fifaRanking : Number.MAX_SAFE_INTEGER;
}

// Returns the emoji flag for a team name. Both the lookup name and the stored
// name are normalised through normTeamName so API name drift (e.g. "Turkey" vs
// "Türkiye") does not produce a blank flag. Falls back to empty string.
function flagOf(teamName: string, allTeams: Team[]): string {
  const target = normTeamName(teamName);
  const match = allTeams.find((t) => normTeamName(t.name) === target);
  return match ? match.flag : "";
}

// Turns a 1-based position into an ordinal word ("1st", "2nd", ...). Used only
// to build human-readable message/detail strings.
function ordinal(n: number): string {
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : n % 10 === 1
        ? "st"
        : n % 10 === 2
          ? "nd"
          : n % 10 === 3
            ? "rd"
            : "th";
  return `${n}${suffix}`;
}

// Locates a team across all groups and reports its current group, its standings
// row, and its 1-based position within that group. Position is taken from the
// ORDER the standings provide: the BallDontLie API already returns each group
// sorted by official position (including head-to-head, which we cannot recompute
// from the data we have), so re-sorting here would be both wrong and unnecessary.
// Returns undefined if the team isn't present in any group's standings.
function findTeamInStandings(
  teamName: string,
  allStandings: GroupStandings[],
): { groupName: string; row: TeamRow; position: number } | undefined {
  const target = normTeamName(teamName);
  for (const group of allStandings) {
    const index = group.teams.findIndex(
      (t) => normTeamName(t.team) === target,
    );
    if (index !== -1) {
      return {
        groupName: group.groupName,
        row: group.teams[index],
        position: index + 1, // index 0 -> 1st, index 2 -> 3rd, etc.
      };
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Third-place cross-group ranking
// ---------------------------------------------------------------------------

// Extracts the third-placed team from every group that has one and ranks them
// against each other using the exact Section 4 tie-breaker order. This is what
// separates the 8 third-placed teams that qualify from the 4 that don't.
//
// Edge case (early tournament): a group's standings may have fewer than 3 rows
// before all matches are entered. Such a group has no third-placed team yet, so
// we skip it. The returned array therefore has between 0 and 12 entries, and a
// team's rank is simply its 0-based index + 1 within this array.
export function rankAllThirdPlaced(
  allStandings: GroupStandings[],
  allTeams: Team[],
): TeamRow[] {
  // One third-placed team per group that actually has a 3rd row.
  const thirdPlacedTeams: TeamRow[] = [];
  for (const group of allStandings) {
    if (group.teams.length >= 3) {
      thirdPlacedTeams.push(group.teams[2]); // index 2 == 3rd place
    }
  }

  // Sort by the Section 4 criteria, in order. Each comparator returns negative
  // when `a` should rank ABOVE `b`. We only fall through to the next criterion
  // when the current one ties (=== 0).
  return thirdPlacedTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points; // 1. Points (higher better)
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff; // 2. Goal diff (higher better)
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor; // 3. Goals for (higher better)
    if (a.fairPlay !== b.fairPlay) return a.fairPlay - b.fairPlay; // 4. Fair play (LOWER better)
    // 5. FIFA ranking (LOWER better), sourced from the hardcoded teams list.
    return fifaRankingOf(a.team, allTeams) - fifaRankingOf(b.team, allTeams);
  });
}

// ---------------------------------------------------------------------------
// Per-team status
// ---------------------------------------------------------------------------

// Determines whether a 4th-placed team is mathematically eliminated. A team is
// still alive only if, in the best possible case (it wins all remaining games
// AND the team currently 3rd wins none), it could reach at least the 3rd-placed
// team's current points — at which point tie-breakers could still rescue it.
// This mirrors the elimination example in Section 4: 0 points with one game left
// (max 3) that still can't catch 3rd place -> eliminated.
function fourthPlaceCanStillQualify(
  fourthRow: TeamRow,
  thirdRow: TeamRow,
): boolean {
  const gamesRemaining = Math.max(0, GROUP_STAGE_MATCHES - fourthRow.played);
  const maxPossiblePoints = fourthRow.points + gamesRemaining * 3;
  // >= (not >) because an exact points tie hands the decision to tie-breakers,
  // which the 4th-placed side could still win.
  return maxPossiblePoints >= thirdRow.points;
}

// Computes the full TeamStatus for a single team. This is the function the
// /api/status route ultimately calls. Logic (per Section 3 & 4):
//   - 0 matches played -> HANGING_ON with a pre-tournament message (neutral state).
//   - Position 1 or 2  -> THROUGH (in an automatic qualifying spot).
//   - Position 3       -> ranked cross-group: top 8 = HANGING_ON, else IN_DANGER.
//   - Position 4       -> OUT if mathematically eliminated, otherwise IN_DANGER
//                         (below the line but still alive).
// Throws a descriptive error if the team can't be found in any group.
export function getTeamStatus(
  teamName: string,
  allStandings: GroupStandings[],
  allTeams: Team[],
): TeamStatus {
  const found = findTeamInStandings(teamName, allStandings);
  if (!found) {
    throw new Error(
      `Team "${teamName}" was not found in any group standings. ` +
        `Check the spelling or whether standings have loaded yet.`,
    );
  }

  const { groupName, row, position } = found;

  // Fields common to every branch below.
  const base = {
    team: row.team,
    flag: flagOf(row.team, allTeams),
    group: groupName,
    groupPosition: position,
    matchesPlayed: row.played,
  };

  // --- Pre-tournament: no matches played yet. ---
  // Return a neutral holding state before the group stage begins so the UI
  // has something sensible to show. HANGING_ON is reused as the status value
  // (no new state is introduced per Section 3); StatusCard detects this message
  // string and renders a grey card instead of the amber warning style.
  if (row.played === 0) {
    return {
      ...base,
      thirdPlaceRank: null,
      status: "HANGING_ON",
      message: "Tournament hasn't started yet",
      detail: "First matches kick off June 11 — check back then",
      canStillQualify: true,
    };
  }

  // --- THROUGH: top two of the group qualify automatically. ---
  if (position === 1 || position === 2) {
    return {
      ...base,
      thirdPlaceRank: null,
      status: "THROUGH",
      message:
        position === 1
          ? `Top of ${groupName} — already qualified`
          : `2nd in ${groupName} — through to the next round`,
      detail: `${ordinal(position)} place with ${row.points} point${row.points === 1 ? "" : "s"}`,
      canStillQualify: true,
    };
  }

  // --- Position 3: ranked against the other third-placed teams cross-group. ---
  if (position === 3) {
    const ranked = rankAllThirdPlaced(allStandings, allTeams);
    const rankIndex = ranked.findIndex(
      (t) => t.team.trim().toLowerCase() === row.team.trim().toLowerCase(),
    );
    // rankIndex should always be found (this team is a 3rd-placed team), but if
    // something is inconsistent we default to the worst case rather than crash.
    const thirdPlaceRank = rankIndex === -1 ? ranked.length : rankIndex + 1;

    const isHangingOn = thirdPlaceRank <= THIRD_PLACE_QUALIFYING_SPOTS;
    return {
      ...base,
      thirdPlaceRank,
      status: isHangingOn ? "HANGING_ON" : "IN_DANGER",
      message: isHangingOn
        ? `3rd in ${groupName} — clinging to a qualifying spot`
        : `3rd in ${groupName} — outside the qualifying places`,
      detail: `Currently ${ordinal(thirdPlaceRank)}-best 3rd-place team (only the top ${THIRD_PLACE_QUALIFYING_SPOTS} go through)`,
      canStillQualify: true,
    };
  }

  // --- Position 4 (or lower, in incomplete early standings). ---
  // Compare against the current 3rd-placed team in the same group to decide
  // whether qualification is still mathematically possible.
  const group = allStandings.find((g) => g.groupName === groupName);
  const thirdRow = group && group.teams.length >= 3 ? group.teams[2] : undefined;

  // If there's no 3rd-placed team to compare against (very early standings),
  // treat the team as still alive — nothing has been decided yet.
  const stillAlive = thirdRow
    ? fourthPlaceCanStillQualify(row, thirdRow)
    : true;

  const gamesRemaining = Math.max(0, GROUP_STAGE_MATCHES - row.played);

  if (!stillAlive) {
    return {
      ...base,
      thirdPlaceRank: null,
      status: "OUT",
      message: `${ordinal(position)} in ${groupName} — eliminated`,
      detail:
        gamesRemaining > 0
          ? `Can't catch the teams above with ${gamesRemaining} game${gamesRemaining === 1 ? "" : "s"} left`
          : `Group stage over — didn't do enough`,
      canStillQualify: false,
    };
  }

  // Below the line but not yet eliminated -> IN_DANGER (see file header note:
  // the spec leaves the state for an alive-4th unnamed; IN_DANGER is the only
  // state that fits "currently outside qualification but still mathematically
  // possible").
  return {
    ...base,
    thirdPlaceRank: null,
    status: "IN_DANGER",
    message: `${ordinal(position)} in ${groupName} — bottom but not beaten`,
    detail:
      gamesRemaining > 0
        ? `Still alive with ${gamesRemaining} game${gamesRemaining === 1 ? "" : "s"} to play`
        : `Needs the third-place places to fall their way`,
    canStillQualify: true,
  };
}

// Runs getTeamStatus for every team in every group and returns all their
// statuses. The cron job uses this to compare the previous and current snapshot
// and detect which teams changed status (e.g. into THROUGH or OUT) so it can
// fire notification emails. Iterating only over teams that exist in the
// standings guarantees getTeamStatus never throws here.
export function getAllTeamStatuses(
  allStandings: GroupStandings[],
  allTeams: Team[],
): TeamStatus[] {
  const statuses: TeamStatus[] = [];
  for (const group of allStandings) {
    for (const row of group.teams) {
      statuses.push(getTeamStatus(row.team, allStandings, allTeams));
    }
  }
  return statuses;
}
