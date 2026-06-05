/* data.jsx — fake-but-faithful product data for the UI kit click-through.
   Mirrors the real app's TeamStatus shape (lib/qualification.ts) and the four
   states from STILLIN_MASTER.md §3. England → HANGING ON is the hero. The five
   popular pills are seeded to showcase every state. Real app reads this live
   from a cron-cached standings feed every 60s; here it's hardcoded. */

const STATE = {
  THROUGH: {
    key: "THROUGH",
    label: "THROUGH",
    live: false,
    ink: "var(--through-ink)",
    fill: "var(--through-fill)",
    fill2: "var(--through-fill-2)",
    tint: "var(--through-tint)",
    tintLine: "var(--through-tint-line)",
  },
  HANGING_ON: {
    key: "HANGING_ON",
    label: "HANGING ON",
    live: true,
    ink: "var(--hanging-ink)",
    fill: "var(--hanging-fill)",
    fill2: "var(--hanging-fill-2)",
    tint: "var(--hanging-tint)",
    tintLine: "var(--hanging-tint-line)",
  },
  IN_DANGER: {
    key: "IN_DANGER",
    label: "IN DANGER",
    live: true,
    ink: "var(--danger-ink)",
    fill: "var(--danger-fill)",
    fill2: "var(--danger-fill-2)",
    tint: "var(--danger-tint)",
    tintLine: "var(--danger-tint-line)",
  },
  OUT: {
    key: "OUT",
    label: "OUT",
    live: false,
    ink: "var(--out-ink)",
    fill: "var(--out-fill)",
    fill2: "var(--out-fill-2)",
    tint: "var(--out-tint)",
    tintLine: "var(--out-tint-line)",
  },
};

// Popular quick-pick pills, in the real app's order.
const POPULAR = ["England", "Brazil", "Argentina", "France", "USA"];

// team → status snapshot. rank = position among the 12 third-placed teams
// (only meaningful for HANGING_ON / IN_DANGER); 8 qualify.
const TEAMS = {
  England:   { name: "England",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "C", played: 2, state: STATE.HANGING_ON,
    message: "Third in Group C — and right now, that's just enough.",
    detail:  "6th of 12 third-placed teams. The top 8 go through.", rank: 6 },
  Brazil:    { name: "Brazil",    flag: "🇧🇷", group: "D", played: 3, state: STATE.THROUGH,
    message: "Brazil are through to the Round of 32.",
    detail:  "Won Group D. Nothing left to sweat.", rank: null },
  Argentina: { name: "Argentina", flag: "🇦🇷", group: "A", played: 3, state: STATE.THROUGH,
    message: "Argentina are through as group winners.",
    detail:  "Top of Group A with a game to spare.", rank: null },
  France:    { name: "France",    flag: "🇫🇷", group: "B", played: 2, state: STATE.IN_DANGER,
    message: "Third in Group B, and slipping out of the queue.",
    detail:  "10th of 12 third-placed teams. Only 8 go through.", rank: 10 },
  USA:       { name: "USA",       flag: "🇺🇸", group: "K", played: 3, state: STATE.OUT,
    message: "It's over — the USA are out of the World Cup.",
    detail:  "Finished 4th in Group K. Eliminated.", rank: null },
  // a couple extra so search returns something beyond the pills
  Spain:     { name: "Spain",     flag: "🇪🇸", group: "H", played: 2, state: STATE.THROUGH,
    message: "Spain are through to the Round of 32.",
    detail:  "Sealed top spot in Group H.", rank: null },
  Germany:   { name: "Germany",   flag: "🇩🇪", group: "C", played: 2, state: STATE.HANGING_ON,
    message: "Second in Group C — holding a qualifying spot.",
    detail:  "Needs a point to be mathematically safe.", rank: null },
  Mexico:    { name: "Mexico",    flag: "🇲🇽", group: "L", played: 2, state: STATE.IN_DANGER,
    message: "Third in Group L and outside the cut.",
    detail:  "9th of 12 third-placed teams. Only 8 go through.", rank: 9 },
};

const TEAM_LIST = Object.values(TEAMS);

// National colours — the IDENTITY of each card. `nat` drives the giant status
// label, the card border, and the qualify-meter pip; `bg` is a faint wash of it
// behind the white card. The WC status (green/amber/red/grey) is layered on top
// only as a small secondary indicator, so every team's card feels its own.
const NATIONAL = {
  England:   { nat: "#CF0000", bg: "#FFF5F5" },
  Brazil:    { nat: "#009C3B", bg: "#F0FBF4" },
  Argentina: { nat: "#4F86C6", bg: "#F2F7FC" },
  France:    { nat: "#003189", bg: "#F1F4FB" },
  USA:       { nat: "#0A3161", bg: "#F1F4F9" },
  Spain:     { nat: "#C60B1E", bg: "#FFF4F4" },
  Germany:   { nat: "#1A1A1A", bg: "#F5F5F4" },
  Mexico:    { nat: "#006847", bg: "#F0FAF5" },
};
function national(name) { return NATIONAL[name] || { nat: "#0A0A0A", bg: "#F7F7F6" }; }

Object.assign(window, { STATE, POPULAR, TEAMS, TEAM_LIST, NATIONAL, national });
