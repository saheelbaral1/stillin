// src/lib/teams.ts
//
// The 48 officially qualified teams for FIFA World Cup 2026.
// Teams, flags, and groups match the official December 5 2024 draw.
// FIFA rankings are pre-tournament values (lower = better) used as the
// final tie-breaker in the cross-group third-place ranking (Section 4).

export type Team = {
  name: string;        // Official FIFA name — must match football-data.org API
  flag: string;        // Emoji flag for the picker and share image
  fifaRanking: number; // Pre-tournament FIFA ranking (lower is better)
  group: string;       // Group letter A–L from the official draw
};

// 48 teams, ordered by group then by seeding within the group.
// Host nations: USA (Group A), Canada (Group B), Mexico (Group C).
export const TEAMS: Team[] = [
  // ── Group A ── USA (host), Uruguay, Panama, Algeria
  { name: "USA",                    flag: "🇺🇸", fifaRanking: 14, group: "A" },
  { name: "Uruguay",                flag: "🇺🇾", fifaRanking: 11, group: "A" },
  { name: "Panama",                 flag: "🇵🇦", fifaRanking: 40, group: "A" },
  { name: "Algeria",                flag: "🇩🇿", fifaRanking: 32, group: "A" },

  // ── Group B ── Canada (host), Belgium, Morocco, Croatia
  { name: "Canada",                 flag: "🇨🇦", fifaRanking: 29, group: "B" },
  { name: "Belgium",                flag: "🇧🇪", fifaRanking: 5,  group: "B" },
  { name: "Morocco",                flag: "🇲🇦", fifaRanking: 10, group: "B" },
  { name: "Croatia",                flag: "🇭🇷", fifaRanking: 13, group: "B" },

  // ── Group C ── Mexico (host), Ecuador, Senegal, New Zealand
  { name: "Mexico",                 flag: "🇲🇽", fifaRanking: 16, group: "C" },
  { name: "Ecuador",                flag: "🇪🇨", fifaRanking: 24, group: "C" },
  { name: "Senegal",                flag: "🇸🇳", fifaRanking: 17, group: "C" },
  { name: "New Zealand",            flag: "🇳🇿", fifaRanking: 42, group: "C" },

  // ── Group D ── England, Netherlands, Côte d'Ivoire, Uzbekistan
  { name: "England",                flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaRanking: 3,  group: "D" },
  { name: "Netherlands",            flag: "🇳🇱", fifaRanking: 7,  group: "D" },
  { name: "Côte d'Ivoire",          flag: "🇨🇮", fifaRanking: 33, group: "D" },
  { name: "Uzbekistan",             flag: "🇺🇿", fifaRanking: 46, group: "D" },

  // ── Group E ── Spain, Germany, South Africa, Jordan
  { name: "Spain",                  flag: "🇪🇸", fifaRanking: 8,  group: "E" },
  { name: "Germany",                flag: "🇩🇪", fifaRanking: 12, group: "E" },
  { name: "South Africa",           flag: "🇿🇦", fifaRanking: 34, group: "E" },
  { name: "Jordan",                 flag: "🇯🇴", fifaRanking: 43, group: "E" },

  // ── Group F ── Brazil, Portugal, Tunisia, Cabo Verde
  { name: "Brazil",                 flag: "🇧🇷", fifaRanking: 4,  group: "F" },
  { name: "Portugal",               flag: "🇵🇹", fifaRanking: 6,  group: "F" },
  { name: "Tunisia",                flag: "🇹🇳", fifaRanking: 28, group: "F" },
  { name: "Cabo Verde",             flag: "🇨🇻", fifaRanking: 45, group: "F" },

  // ── Group G ── Argentina, Australia, Austria, Haiti
  { name: "Argentina",              flag: "🇦🇷", fifaRanking: 1,  group: "G" },
  { name: "Australia",              flag: "🇦🇺", fifaRanking: 23, group: "G" },
  { name: "Austria",                flag: "🇦🇹", fifaRanking: 25, group: "G" },
  { name: "Haiti",                  flag: "🇭🇹", fifaRanking: 48, group: "G" },

  // ── Group H ── France, Türkiye, Korea Republic, Bosnia and Herzegovina
  { name: "France",                 flag: "🇫🇷", fifaRanking: 2,  group: "H" },
  { name: "Türkiye",                flag: "🇹🇷", fifaRanking: 22, group: "H" },
  { name: "Korea Republic",         flag: "🇰🇷", fifaRanking: 20, group: "H" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", fifaRanking: 37, group: "H" },

  // ── Group I ── Japan, Saudi Arabia, Scotland, Sweden
  { name: "Japan",                  flag: "🇯🇵", fifaRanking: 15, group: "I" },
  { name: "Saudi Arabia",           flag: "🇸🇦", fifaRanking: 38, group: "I" },
  { name: "Scotland",               flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", fifaRanking: 26, group: "I" },
  { name: "Sweden",                 flag: "🇸🇪", fifaRanking: 27, group: "I" },

  // ── Group J ── Colombia, IR Iran, Czechia, Norway
  { name: "Colombia",               flag: "🇨🇴", fifaRanking: 9,  group: "J" },
  { name: "IR Iran",                flag: "🇮🇷", fifaRanking: 21, group: "J" },
  { name: "Czechia",                flag: "🇨🇿", fifaRanking: 30, group: "J" },
  { name: "Norway",                 flag: "🇳🇴", fifaRanking: 19, group: "J" },

  // ── Group K ── Paraguay, Qatar, Congo DR, Curaçao
  { name: "Paraguay",               flag: "🇵🇾", fifaRanking: 39, group: "K" },
  { name: "Qatar",                  flag: "🇶🇦", fifaRanking: 41, group: "K" },
  { name: "Congo DR",               flag: "🇨🇩", fifaRanking: 35, group: "K" },
  { name: "Curaçao",                flag: "🇨🇼", fifaRanking: 47, group: "K" },

  // ── Group L ── Switzerland, Egypt, Ghana, Iraq
  { name: "Switzerland",            flag: "🇨🇭", fifaRanking: 18, group: "L" },
  { name: "Egypt",                  flag: "🇪🇬", fifaRanking: 31, group: "L" },
  { name: "Ghana",                  flag: "🇬🇭", fifaRanking: 36, group: "L" },
  { name: "Iraq",                   flag: "🇮🇶", fifaRanking: 44, group: "L" },
];

// Common aliases that differ from official FIFA names used in this file.
// The football-data.org API and user inputs often use these alternatives.
const ALIASES: Record<string, string> = {
  "iran":              "ir iran",
  "turkey":            "türkiye",
  "south korea":       "korea republic",
  "republic of korea": "korea republic",
  "ivory coast":       "côte d'ivoire",
  "cote d'ivoire":     "côte d'ivoire",
  "dr congo":          "congo dr",
  "bosnia":            "bosnia and herzegovina",
  "bosnia & herzegovina": "bosnia and herzegovina",
};

// Looks up a team by name, case-insensitively, with alias resolution.
// Used by the status API and the picker so ?team=iran resolves to "IR Iran".
// Returns undefined when no team matches, so callers can return a clean 404.
export function getTeamByName(name: string): Team | undefined {
  const raw    = name.trim().toLowerCase();
  const target = ALIASES[raw] ?? raw;
  return TEAMS.find((team) => team.name.toLowerCase() === target);
}
