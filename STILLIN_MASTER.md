# STILLIN_MASTER.md
# Still In? — Claude Code Master Reference File
# Last updated: June 2026
# Chief Engineer: Claude (via claude.ai)
# Hands: Claude Code
# Founder: Saheel Baral

---

## 0. HOW CLAUDE CODE MUST BEHAVE

This file is the single source of truth for every decision made in this project.

Claude Code must follow these rules without exception:

- **Never make a decision not covered in this file without flagging it first.** If something is unclear, ambiguous, or not specified — stop and ask. Do not assume.
- **Never install a package not listed in Section 6.** If you think a new package is needed, state why and wait for approval.
- **Never create a file not listed in Section 7.** If a new file is needed, flag it first.
- **Never change the database schema** without explicit instruction referencing this file.
- **Never modify `.env.local`** — only reference variable names from Section 5.
- **Every function must have a comment explaining what it does and why.**
- **Every API call must have error handling and a timeout.**
- **No inline styles.** Use Tailwind classes only.
- **No `any` types in TypeScript.** All types must be explicitly defined.
- **When in doubt, do less. Flag it. Wait for direction.**

---

## 1. PRODUCT OVERVIEW

**Name:** Still In?
**Wordmark:** still in? (lowercase, DM Mono font)
**Tagline:** For people who are half-watching.
**URL:** stillin.app (target domain)

**What it is:** A single-page web app that tells football fans in plain English whether their team is still in the FIFA World Cup 2026 — updated live, every 60 seconds during matches.

**What it is NOT:**
- Not a stats dashboard
- Not a fixtures list
- Not a score tracker
- Not a news app
- Not an app with navigation, tabs, or multiple pages

**The one question it answers:** Is [team] still in the World Cup?

**The one screen it has:** Team picker → Status card. That's it.

---

## 2. THE PROBLEM IT SOLVES

FIFA World Cup 2026 has a new, genuinely confusing format:
- 48 teams across 12 groups
- Top 2 from each group qualify automatically (24 teams)
- Best 8 of the 12 third-placed teams also qualify
- Third-place ranking is done CROSS-GROUP — all 12 third-placed teams ranked simultaneously by: Points → Goal Difference → Goals For → Fair Play → FIFA Ranking

This means on June 25–27 (last day of group stage), millions of fans are watching multiple matches simultaneously, unable to figure out if their team is through. No clean, simple tool exists for this. We are building it.

---

## 3. THE FOUR STATES

Every team is always in exactly one of these states:

| State | Condition | UI Colour | Label |
|-------|-----------|-----------|-------|
| THROUGH | Position 1 or 2 in group, OR top-8 third-place confirmed | Green #16A34A | ✅ THROUGH |
| HANGING_ON | Position 3, currently ranked 1st–8th cross-group, not yet confirmed | Amber #D97706 | ⚠️ HANGING ON |
| IN_DANGER | Position 3, currently ranked 9th–12th cross-group | Red #DC2626 | 🔴 IN DANGER |
| OUT | Position 4, OR mathematically eliminated | Grey #6B7280 | ❌ OUT |

**State transition rules:**
- A team moves between HANGING_ON and IN_DANGER as other matches update
- A team becomes THROUGH only when mathematically confirmed (not just currently leading)
- A team becomes OUT only when mathematically eliminated
- During the knockout stage: only THROUGH (still in) or OUT (eliminated) apply

---

## 4. QUALIFICATION LOGIC — THE CORE OF THE PRODUCT

This is the most important code in the project. It must be written carefully, tested against hardcoded scenarios, and never modified without explicit approval.

### Group Stage Qualification Rules (FIFA WC 2026 Official)
1. Top 2 teams in each group qualify → 24 teams
2. Best 8 of 12 third-placed teams qualify → 8 teams
3. Total Round of 32 = 32 teams

### Third-Place Ranking Criteria (in order):
1. Points
2. Goal difference
3. Goals scored
4. Fair play points (yellow = -1, red = -3, yellow+red = -4) — LOWER is better
5. FIFA ranking (pre-tournament, hardcoded) — LOWER number is better

### Mathematical elimination (OUT before group stage ends):
- A 4th-placed team with 0 points and 1 game remaining where maximum possible = 3 points, but even 3 points cannot mathematically beat the current 3rd place team → ELIMINATED
- Calculate: can this team still reach enough points to be in top-8 third place? If no → OUT

### Hardcoded FIFA Rankings (pre-tournament, do not change):
```
Argentina: 1, France: 2, England: 3, Brazil: 4, Belgium: 5,
Portugal: 6, Netherlands: 7, Spain: 8, Croatia: 9, Italy: 10,
USA: 11, Mexico: 12, Uruguay: 13, Switzerland: 14, Germany: 15,
Colombia: 16, Senegal: 17, Denmark: 18, Morocco: 19, Japan: 20,
Iran: 21, South Korea: 22, Australia: 23, Canada: 24, Ecuador: 25,
Qatar: 26, Saudi Arabia: 27, Tunisia: 28, Cameroon: 29, Ghana: 30,
Nigeria: 31, Algeria: 32, Egypt: 33, Ivory Coast: 34, Mali: 35,
Burkina Faso: 36, South Africa: 37, DR Congo: 38, Zambia: 39, Benin: 40,
New Zealand: 41, Panama: 42, Costa Rica: 43, Honduras: 44, Guatemala: 45,
El Salvador: 46, Cuba: 47, Trinidad and Tobago: 48
```
*(Adjust exact rankings from official FIFA list before tournament starts)*

---

## 5. ENVIRONMENT VARIABLES

These are the only environment variables in this project. Never add others without updating this file.

```
BALLDONTLIE_API_KEY          # BallDontLie FIFA API authentication
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL (public, safe for browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key (public, RLS protects data)
SUPABASE_SERVICE_ROLE_KEY    # Supabase service role (server only, never expose to browser)
GEMINI_API_KEY               # Google Gemini 1.5 Flash (free tier, AI explanations)
RESEND_API_KEY               # Resend email (add later, leave blank for now)
CRON_SECRET                  # Protects /api/cron/refresh from being called by anyone except Vercel
```

**Rules:**
- Variables prefixed `NEXT_PUBLIC_` are safe to use in client components
- `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` and `BALLDONTLIE_API_KEY` are SERVER ONLY — never import in client components
- Never log environment variables

---

## 6. APPROVED PACKAGES

Only these packages may be installed. No others without approval.

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@supabase/supabase-js": "latest",
    "@google/generative-ai": "latest",
    "resend": "latest"
  },
  "devDependencies": {
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "@types/node": "latest",
    "@types/react": "latest"
  }
}
```

**Not allowed without approval:** axios, lodash, moment, date-fns, react-query, zustand, redux, any UI component library, any charting library, any animation library.

---

## 7. FILE STRUCTURE

Every file that will exist in this project. Claude Code may only create files listed here.

```
stillin/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home page — team picker + status card
│   │   ├── layout.tsx                  # Root layout — fonts, metadata
│   │   ├── globals.css                 # Tailwind base only
│   │   └── api/
│   │       ├── status/
│   │       │   └── route.ts            # GET /api/status?team=Brazil → TeamStatus
│   │       ├── notify/
│   │       │   └── route.ts            # POST /api/notify → saves email to Supabase
│   │       ├── explain/
│   │       │   └── route.ts            # GET /api/explain?team=X&status=Y → AI explanation
│   │       └── cron/
│   │           └── refresh/
│   │               └── route.ts        # GET /api/cron/refresh → fetches API, writes cache
│   ├── lib/
│   │   ├── balldontlie.ts             # BallDontLie API wrapper + TypeScript types
│   │   ├── qualification.ts           # Core qualification logic — THE MOST IMPORTANT FILE
│   │   ├── supabase.ts                # Supabase client (anon, for client components)
│   │   ├── supabase-server.ts         # Supabase client (service role, server only)
│   │   └── teams.ts                   # Hardcoded list of 48 teams, flags, FIFA rankings
│   └── components/
│       ├── TeamPicker.tsx             # Searchable team selector with flag + popular pills
│       ├── StatusCard.tsx             # The big status display — all 4 states
│       ├── ShareButton.tsx            # Copies stillin.app/?team=X to clipboard
│       ├── NotifyCapture.tsx          # Email input — "notify me when it's decided"
│       └── ExplainButton.tsx          # "Wait, what does this mean?" → Gemini explanation
├── supabase/
│   └── migrations/
│       └── 001_initial.sql            # Already run — standings_cache, notifications, ai_explanations
├── public/
│   └── og/                            # OG images generated server-side via next/og
├── vercel.json                        # Cron job configuration
├── STILLIN_MASTER.md                  # THIS FILE — always update when decisions change
└── .env.local                         # Never commit, never log
```

---

## 8. DATABASE SCHEMA

Three tables. Already created in Supabase. Do not alter without approval.

### standings_cache
Stores the raw BallDontLie API response every 60 seconds.
```sql
id          uuid PRIMARY KEY
fetched_at  timestamptz DEFAULT now()
data        jsonb          -- full API response
is_live     boolean        -- true when a match is in progress
```

### notifications
Stores email addresses for "notify me when it's decided."
```sql
id          uuid PRIMARY KEY
email       text NOT NULL
team        text NOT NULL
notified    boolean DEFAULT false
created_at  timestamptz DEFAULT now()
```

### ai_explanations
Caches Gemini-generated explanations. One per team+status combination.
```sql
id          uuid PRIMARY KEY
team        text NOT NULL
status      text NOT NULL
explanation text NOT NULL
created_at  timestamptz DEFAULT now()
UNIQUE(team, status)       -- never generate twice for same state
```

---

## 9. API ROUTES — EXACT BEHAVIOUR

### GET /api/status?team=Brazil
1. Read latest row from `standings_cache` in Supabase
2. Parse the data, find the requested team
3. Run `getTeamStatus()` from `qualification.ts`
4. Return `TeamStatus` object
- Never calls BallDontLie directly — always reads from cache
- Returns 404 if team not found
- Returns 503 if cache is empty or older than 10 minutes

### GET /api/cron/refresh
1. Fetch `/group_standings` from BallDontLie
2. Fetch `/games` from BallDontLie to check if any match is live
3. Write new row to `standings_cache`
4. Check `notifications` table — if any team's status changed to THROUGH or OUT, trigger email via Resend
5. Return `{ ok: true, isLive: boolean, teamsUpdated: number }`
- Protected: check for `CRON_SECRET` header in production
- Called by Vercel Cron every minute

### POST /api/notify
Body: `{ email: string, team: string }`
1. Validate email format
2. Check for duplicate — if same email+team already exists, return 200 silently
3. Insert into `notifications` table
4. Return `{ ok: true }`

### GET /api/explain?team=Brazil&status=HANGING_ON
1. Check `ai_explanations` table for existing row with this team+status
2. If exists → return cached explanation immediately
3. If not → call Gemini 1.5 Flash with the system prompt from Section 10
4. Save to `ai_explanations` table
5. Stream response back to client
- Never generates twice for the same team+status combination

---

## 10. AI EXPLANATION — GEMINI PROMPT

This is the exact system prompt to use for the "Wait, what does this mean?" feature. Do not change without approval.

```
You explain World Cup 2026 qualification to people who barely follow football.

Rules:
- Maximum 3 sentences
- Zero football jargon — no "clean sheet", "aggregate", "xG", etc.
- No statistics or numbers unless absolutely essential
- Speak like a friend explaining it at a pub
- End every explanation with one word: either "RELAX" or "NERVOUS"
- That final word is on its own line

The team's current status is: {STATUS}
The team's name is: {TEAM}
Additional context: {CONTEXT}

Example output for HANGING_ON:
"Your team is basically in a queue to sneak through — they've done enough to maybe make it, but it depends on a few other matches finishing a certain way. Think of it like being 7th in line where only 8 people get in. One person ahead of you needs to stumble.
RELAX"
```

---

## 11. DESIGN TOKENS

These exact values must be used. No deviations.

### Colours
```
Page background:    #F5F4F0
Card background:    #FFFFFF
Primary text:       #111111
Secondary text:     #444444
Muted text:         #888888

THROUGH colour:     #16A34A
THROUGH card bg:    #DCFCE7
THROUGH border:     #BBF7D0

HANGING_ON colour:  #D97706
HANGING_ON card bg: #FEF3C7
HANGING_ON border:  #FDE68A

IN_DANGER colour:   #DC2626
IN_DANGER card bg:  #FEE2E2
IN_DANGER border:   #FECACA

OUT colour:         #6B7280
OUT card bg:        #F3F4F6
OUT border:         #E5E7EB
```

### Typography
```
Display / team name:  Syne 800, tracking -0.03em
Status headline:      Syne 800, tracking -0.02em
Body text:            DM Sans 400
Labels / timestamp:   DM Mono 400
Wordmark:             DM Mono 500, lowercase "still in?"
```

### Spacing
```
Page max width:         480px (centred)
Page horizontal pad:    20px
Card border-radius:     20px
Card padding:           32px 28px
Card border:            2px solid (state border colour)
Button border-radius:   12px
Button height:          48px
Search input height:    56px
Gap card → buttons:     20px
Gap buttons → email:    16px
```

### Fonts (Google Fonts — load in layout.tsx)
```
Syne: weights 400, 600, 700, 800
DM Sans: weights 300, 400, 500
DM Mono: weights 300, 400, 500
```

---

## 12. CRON JOB CONFIGURATION

File: `vercel.json` in project root.

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "* * * * *"
    }
  ]
}
```

Every minute. Vercel Pro required for per-minute crons. On free tier it runs every hour — acceptable for pre-launch testing, upgrade before June 11.

---

## 13. SHARE IMAGE SPEC

Generated via `next/og` at `/api/og?team=Brazil&status=THROUGH`.

```
Size:        1200 × 1200px
Background:  #0F0F0F (dark)
Flag:        ~180px emoji, centred
Team name:   DM Mono, 24px, #666666, uppercase, letter-spacing 0.15em
Status icon: 80px emoji
Status text: Syne 800, ~80px, state colour
Detail text: DM Sans, 28px, #999999
URL:         "stillin.app · World Cup 2026", DM Mono, 20px, #444444, bottom
```

---

## 14. BUILD ORDER

Follow this exactly. Do not skip ahead.

- [x] Step 1: Next.js project scaffolded
- [x] Step 2: Pushed to GitHub
- [x] Step 3: Deployed to Vercel
- [x] Step 4: Supabase tables created
- [ ] Step 5: `src/lib/balldontlie.ts` — API wrapper + types
- [ ] Step 6: `src/lib/teams.ts` — 48 teams hardcoded
- [ ] Step 7: `src/lib/qualification.ts` — core logic, tested
- [ ] Step 8: `src/lib/supabase.ts` + `supabase-server.ts`
- [ ] Step 9: `src/app/api/cron/refresh/route.ts` — cron job
- [ ] Step 10: `src/app/api/status/route.ts` — status endpoint
- [ ] Step 11: `src/components/TeamPicker.tsx`
- [ ] Step 12: `src/components/StatusCard.tsx`
- [ ] Step 13: `src/app/page.tsx` — wire everything together
- [ ] Step 14: `src/components/ShareButton.tsx`
- [ ] Step 15: `src/components/NotifyCapture.tsx` + `src/app/api/notify/route.ts`
- [ ] Step 16: `src/components/ExplainButton.tsx` + `src/app/api/explain/route.ts`
- [ ] Step 17: `src/app/api/og/route.tsx` — share image generation
- [ ] Step 18: `vercel.json` — cron config
- [ ] Step 19: End-to-end test on live URL
- [ ] Step 20: Reddit posts queued, domain pointed

---

## 15. WHAT WE ARE NOT BUILDING (DO NOT ADD)

- No authentication / user accounts
- No dashboard or admin panel
- No match fixtures or schedule view
- No historical stats or player data
- No dark mode toggle
- No i18n / multiple languages
- No push notifications (email only)
- No social login
- No payment / monetisation layer (this tournament — email list only)
- No mobile app wrapper

If a feature is not in this file, it does not exist yet. Flag it, don't build it.

---

*This file must be updated every time a decision changes. Claude Code reads this before every action.*
