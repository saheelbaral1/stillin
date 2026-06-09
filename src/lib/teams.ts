// src/lib/teams.ts
//
// The 48 officially qualified teams for FIFA World Cup 2026.
// Teams, flags, and groups match the official draw.
// FIFA rankings are approximate November 2025 pre-tournament values (lower = better)
// used as the final tie-breaker in the cross-group third-place ranking (Section 4).

export type Team = {
  name: string;        // Official FIFA name — must match football-data.org API
  flag: string;        // Emoji flag for the picker and share image
  fifaRanking: number; // Pre-tournament FIFA ranking (lower is better)
  group: string;       // Group letter A–L from the official draw
};

// 48 teams, ordered by group then by seeding within the group.
// Host nations: Mexico (Group A), Canada (Group B), USA (Group D).
export const TEAMS: Team[] = [
  // ── Group A ── Mexico (host), South Africa, Korea Republic, Czechia
  { name: "Mexico",                 flag: "🇲🇽", fifaRanking: 15, group: "A" },
  { name: "South Africa",           flag: "🇿🇦", fifaRanking: 32, group: "A" },
  { name: "Korea Republic",         flag: "🇰🇷", fifaRanking: 19, group: "A" },
  { name: "Czechia",                flag: "🇨🇿", fifaRanking: 34, group: "A" },

  // ── Group B ── Canada (host), Bosnia and Herzegovina, Qatar, Switzerland
  { name: "Canada",                 flag: "🇨🇦", fifaRanking: 20, group: "B" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", fifaRanking: 43, group: "B" },
  { name: "Qatar",                  flag: "🇶🇦", fifaRanking: 41, group: "B" },
  { name: "Switzerland",            flag: "🇨🇭", fifaRanking: 16, group: "B" },

  // ── Group C ── Brazil, Morocco, Haiti, Scotland
  { name: "Brazil",                 flag: "🇧🇷", fifaRanking: 5,  group: "C" },
  { name: "Morocco",                flag: "🇲🇦", fifaRanking: 12, group: "C" },
  { name: "Haiti",                  flag: "🇭🇹", fifaRanking: 44, group: "C" },
  { name: "Scotland",               flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", fifaRanking: 24, group: "C" },

  // ── Group D ── USA (host), Paraguay, Australia, Türkiye
  { name: "USA",                    flag: "🇺🇸", fifaRanking: 14, group: "D" },
  { name: "Paraguay",               flag: "🇵🇾", fifaRanking: 28, group: "D" },
  { name: "Australia",              flag: "🇦🇺", fifaRanking: 21, group: "D" },
  { name: "Türkiye",                flag: "🇹🇷", fifaRanking: 23, group: "D" },

  // ── Group E ── Germany, Curaçao, Côte d'Ivoire, Ecuador
  { name: "Germany",                flag: "🇩🇪", fifaRanking: 9,  group: "E" },
  { name: "Curaçao",                flag: "🇨🇼", fifaRanking: 48, group: "E" },
  { name: "Côte d'Ivoire",          flag: "🇨🇮", fifaRanking: 30, group: "E" },
  { name: "Ecuador",                flag: "🇪🇨", fifaRanking: 22, group: "E" },

  // ── Group F ── Netherlands, Japan, Sweden, Tunisia
  { name: "Netherlands",            flag: "🇳🇱", fifaRanking: 8,  group: "F" },
  { name: "Japan",                  flag: "🇯🇵", fifaRanking: 13, group: "F" },
  { name: "Sweden",                 flag: "🇸🇪", fifaRanking: 26, group: "F" },
  { name: "Tunisia",                flag: "🇹🇳", fifaRanking: 42, group: "F" },

  // ── Group G ── Belgium, Egypt, IR Iran, New Zealand
  { name: "Belgium",                flag: "🇧🇪", fifaRanking: 7,  group: "G" },
  { name: "Egypt",                  flag: "🇪🇬", fifaRanking: 36, group: "G" },
  { name: "IR Iran",                flag: "🇮🇷", fifaRanking: 31, group: "G" },
  { name: "New Zealand",            flag: "🇳🇿", fifaRanking: 46, group: "G" },

  // ── Group H ── Spain, Cabo Verde, Saudi Arabia, Uruguay
  { name: "Spain",                  flag: "🇪🇸", fifaRanking: 3,  group: "H" },
  { name: "Cabo Verde",             flag: "🇨🇻", fifaRanking: 40, group: "H" },
  { name: "Saudi Arabia",           flag: "🇸🇦", fifaRanking: 33, group: "H" },
  { name: "Uruguay",                flag: "🇺🇾", fifaRanking: 10, group: "H" },

  // ── Group I ── France, Senegal, Iraq, Norway
  { name: "France",                 flag: "🇫🇷", fifaRanking: 2,  group: "I" },
  { name: "Senegal",                flag: "🇸🇳", fifaRanking: 17, group: "I" },
  { name: "Iraq",                   flag: "🇮🇶", fifaRanking: 35, group: "I" },
  { name: "Norway",                 flag: "🇳🇴", fifaRanking: 25, group: "I" },

  // ── Group J ── Argentina, Algeria, Austria, Jordan
  { name: "Argentina",              flag: "🇦🇷", fifaRanking: 1,  group: "J" },
  { name: "Algeria",                flag: "🇩🇿", fifaRanking: 29, group: "J" },
  { name: "Austria",                flag: "🇦🇹", fifaRanking: 27, group: "J" },
  { name: "Jordan",                 flag: "🇯🇴", fifaRanking: 38, group: "J" },

  // ── Group K ── Portugal, Congo DR, Uzbekistan, Colombia
  { name: "Portugal",               flag: "🇵🇹", fifaRanking: 6,  group: "K" },
  { name: "Congo DR",               flag: "🇨🇩", fifaRanking: 37, group: "K" },
  { name: "Uzbekistan",             flag: "🇺🇿", fifaRanking: 45, group: "K" },
  { name: "Colombia",               flag: "🇨🇴", fifaRanking: 11, group: "K" },

  // ── Group L ── England, Croatia, Ghana, Panama
  { name: "England",                flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaRanking: 4,  group: "L" },
  { name: "Croatia",                flag: "🇭🇷", fifaRanking: 18, group: "L" },
  { name: "Ghana",                  flag: "🇬🇭", fifaRanking: 39, group: "L" },
  { name: "Panama",                 flag: "🇵🇦", fifaRanking: 47, group: "L" },
];

// The most-followed teams, surfaced on the homepage "big names" status board.
// Names must match TEAMS[].name exactly so getTeamStatus can find them in the
// standings. Order here is the order they render in the board.
export const FEATURED_TEAMS: string[] = [
  "Brazil",
  "Argentina",
  "France",
  "England",
  "Spain",
  "USA",
];

// Common aliases that differ from official FIFA names used in this file.
// The football-data.org API and user inputs often use these alternatives.
const ALIASES: Record<string, string> = {
  "iran":                    "ir iran",
  "turkey":                  "türkiye",
  "south korea":             "korea republic",
  "republic of korea":       "korea republic",
  "ivory coast":             "côte d'ivoire",
  "cote d'ivoire":           "côte d'ivoire",
  "cape verde":              "cabo verde",
  "dr congo":                "congo dr",
  "bosnia":                  "bosnia and herzegovina",
  "bosnia & herzegovina":    "bosnia and herzegovina",
  "united states":           "usa",
  "curacao":                 "curaçao",
};

// Looks up a team by name, case-insensitively, with alias resolution.
// Used by the status API and the picker so ?team=iran resolves to "IR Iran".
// Returns undefined when no team matches, so callers can return a clean 404.
export function getTeamByName(name: string): Team | undefined {
  const raw    = name.trim().toLowerCase();
  const target = ALIASES[raw] ?? raw;
  return TEAMS.find((team) => team.name.toLowerCase() === target);
}
