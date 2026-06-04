// src/lib/teams.ts
//
// The 48 teams of FIFA World Cup 2026, hardcoded. This is reference data the
// product needs even before any API call: flags for the picker, the
// pre-tournament FIFA ranking (used as the final tie-breaker in the
// qualification logic, Section 4), and which group each team is in.
//
// FIFA rankings are taken verbatim from Section 4 of STILLIN_MASTER.md (lower
// number = better). Group allocations are a realistic pot-based (snake) draw
// across groups A–L, 4 teams per group.
//
// FLAG: the master file does not pin the actual WC 2026 group draw, so these
// group assignments are our own realistic seeding. Update `group` values here
// once the official draw is confirmed — nothing else in this file needs to
// change.

// A single team's static reference data.
export type Team = {
  name: string; // Display name, also the key used in URLs and API lookups
  flag: string; // Emoji flag for the picker and share image
  fifaRanking: number; // Pre-tournament FIFA ranking (lower is better)
  group: string; // Group letter A–L
};

// All 48 teams. Ordered by group (A→L) then by seeding within the group, which
// keeps the picker list and any group-based rendering predictable.
export const TEAMS: Team[] = [
  // Group A
  { name: "Argentina", flag: "🇦🇷", fifaRanking: 1, group: "A" },
  { name: "Uruguay", flag: "🇺🇾", fifaRanking: 13, group: "A" },
  { name: "Ecuador", flag: "🇪🇨", fifaRanking: 25, group: "A" },
  { name: "South Africa", flag: "🇿🇦", fifaRanking: 37, group: "A" },

  // Group B
  { name: "France", flag: "🇫🇷", fifaRanking: 2, group: "B" },
  { name: "Switzerland", flag: "🇨🇭", fifaRanking: 14, group: "B" },
  { name: "Qatar", flag: "🇶🇦", fifaRanking: 26, group: "B" },
  { name: "DR Congo", flag: "🇨🇩", fifaRanking: 38, group: "B" },

  // Group C
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaRanking: 3, group: "C" },
  { name: "Germany", flag: "🇩🇪", fifaRanking: 15, group: "C" },
  { name: "Saudi Arabia", flag: "🇸🇦", fifaRanking: 27, group: "C" },
  { name: "Zambia", flag: "🇿🇲", fifaRanking: 39, group: "C" },

  // Group D
  { name: "Brazil", flag: "🇧🇷", fifaRanking: 4, group: "D" },
  { name: "Colombia", flag: "🇨🇴", fifaRanking: 16, group: "D" },
  { name: "Tunisia", flag: "🇹🇳", fifaRanking: 28, group: "D" },
  { name: "Benin", flag: "🇧🇯", fifaRanking: 40, group: "D" },

  // Group E
  { name: "Belgium", flag: "🇧🇪", fifaRanking: 5, group: "E" },
  { name: "Senegal", flag: "🇸🇳", fifaRanking: 17, group: "E" },
  { name: "Cameroon", flag: "🇨🇲", fifaRanking: 29, group: "E" },
  { name: "New Zealand", flag: "🇳🇿", fifaRanking: 41, group: "E" },

  // Group F
  { name: "Portugal", flag: "🇵🇹", fifaRanking: 6, group: "F" },
  { name: "Denmark", flag: "🇩🇰", fifaRanking: 18, group: "F" },
  { name: "Ghana", flag: "🇬🇭", fifaRanking: 30, group: "F" },
  { name: "Panama", flag: "🇵🇦", fifaRanking: 42, group: "F" },

  // Group G
  { name: "Netherlands", flag: "🇳🇱", fifaRanking: 7, group: "G" },
  { name: "Morocco", flag: "🇲🇦", fifaRanking: 19, group: "G" },
  { name: "Nigeria", flag: "🇳🇬", fifaRanking: 31, group: "G" },
  { name: "Costa Rica", flag: "🇨🇷", fifaRanking: 43, group: "G" },

  // Group H
  { name: "Spain", flag: "🇪🇸", fifaRanking: 8, group: "H" },
  { name: "Japan", flag: "🇯🇵", fifaRanking: 20, group: "H" },
  { name: "Algeria", flag: "🇩🇿", fifaRanking: 32, group: "H" },
  { name: "Honduras", flag: "🇭🇳", fifaRanking: 44, group: "H" },

  // Group I
  { name: "Croatia", flag: "🇭🇷", fifaRanking: 9, group: "I" },
  { name: "Iran", flag: "🇮🇷", fifaRanking: 21, group: "I" },
  { name: "Egypt", flag: "🇪🇬", fifaRanking: 33, group: "I" },
  { name: "Guatemala", flag: "🇬🇹", fifaRanking: 45, group: "I" },

  // Group J
  { name: "Italy", flag: "🇮🇹", fifaRanking: 10, group: "J" },
  { name: "South Korea", flag: "🇰🇷", fifaRanking: 22, group: "J" },
  { name: "Ivory Coast", flag: "🇨🇮", fifaRanking: 34, group: "J" },
  { name: "El Salvador", flag: "🇸🇻", fifaRanking: 46, group: "J" },

  // Group K
  { name: "USA", flag: "🇺🇸", fifaRanking: 11, group: "K" },
  { name: "Australia", flag: "🇦🇺", fifaRanking: 23, group: "K" },
  { name: "Mali", flag: "🇲🇱", fifaRanking: 35, group: "K" },
  { name: "Cuba", flag: "🇨🇺", fifaRanking: 47, group: "K" },

  // Group L
  { name: "Mexico", flag: "🇲🇽", fifaRanking: 12, group: "L" },
  { name: "Canada", flag: "🇨🇦", fifaRanking: 24, group: "L" },
  { name: "Burkina Faso", flag: "🇧🇫", fifaRanking: 36, group: "L" },
  { name: "Trinidad and Tobago", flag: "🇹🇹", fifaRanking: 48, group: "L" },
];

// Looks up a team by name, case-insensitively. Used by the status API and the
// picker so a URL like ?team=brazil resolves the same as ?team=Brazil. Returns
// undefined when no team matches, so callers can return a clean 404.
export function getTeamByName(name: string): Team | undefined {
  const target = name.trim().toLowerCase();
  return TEAMS.find((team) => team.name.toLowerCase() === target);
}
