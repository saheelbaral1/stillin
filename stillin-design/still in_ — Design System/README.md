# still in? — Design System

**One question, one answer.** *still in?* is a single-purpose mobile web app that tells a football fan, in plain English, whether their team is still in the **FIFA World Cup 2026** — updated live every 60 seconds during matches. No tables, no fixtures, no jargon. You pick your team; it shows you a status. That's the whole product.

> Wordmark: **still in?** (always lowercase) · Tagline: *For people who are half-watching.*
> Domain: **stillin.app** · Platform: mobile web, 390px viewport

---

## Sources

This system was reconstructed from the product's own source code. Explore these directly for the highest-fidelity understanding of the product — the design system is a derivative, not the primary source.

- **GitHub:** [`saheelbaral1/stillin`](https://github.com/saheelbaral1/stillin) — Next.js 15 / React 18 / Tailwind CSS app.
  - `STILLIN_MASTER.md` — the founder's master reference: product spec, the four qualification states, the official WC2026 third-place tiebreaker rules, the original design token set (§11), and copy guidelines. **Read this first** before building anything against this product.
  - `src/components/StatusCard.tsx` — the hero card (all four states, live heartbeat, qualify meter)
  - `src/components/TeamPicker.tsx` — the search screen (input, popular pills, dropdown)
  - `src/components/ShareButton.tsx` — Web Share API + clipboard fallback
  - `src/components/NotifyCapture.tsx` — email capture form with Supabase write
  - `src/components/ExplainButton.tsx` — the AI explainer (calls `/api/explain` → Claude)
  - `src/lib/teams.ts` — all 48 WC2026 teams: name, flag emoji, group, FIFA ranking

### Art-direction note

The shipped app (per `STILLIN_MASTER.md` §11) uses a warm off-white page (`#F5F4F0`) and **Syne** as its display face. This design system applies the **premium broadcast-scoreboard direction** requested in the design brief — pure white `#FFFFFF` background, **Saira Condensed** for the status label, and deep confidence-fill status cards — while preserving the product's real states, qualification logic, and copy verbatim.

---

## What the product is (and isn't)

The 2026 tournament introduced a genuinely confusing format: **48 teams, 12 groups, top 2 of each group qualify automatically, plus the best 8 of the 12 third-placed teams** — ranked cross-group on points → goal difference → goals scored → fair play → FIFA ranking, simultaneously, on the final group-stage day. Millions of fans watch several matches at once with no idea if their team is still alive. *still in?* exists for that exact moment.

It is deliberately **one screen, one answer**. It is *not* a stats dashboard, a fixtures list, a score tracker, or a news app. There is no navigation, no tabs, no account required.

### The four states — the heart of the system

Every team is in exactly one state at all times. The state drives the card fill colour, the status label, and whether the live heartbeat shows.

| State | Meaning | Fill | On-fill label |
|-------|---------|------|--------------|
| **THROUGH** | Mathematically qualified | `#14532D` dark green | `THROUGH` |
| **HANGING ON** | 3rd place, currently inside cross-group top 8 | `#92400E` dark amber | `HANGING ON` |
| **IN DANGER** | 3rd place, currently outside the top 8 | `#7F1D1D` dark red | `IN DANGER` |
| **OUT** | Mathematically eliminated | `#1F2937` dark grey | `OUT` |

England → **HANGING ON** is the emotional hero of the design: amber, tense, pulsing, with the qualify-meter showing exactly how close the cut is.

---

## CONTENT FUNDAMENTALS

The voice is a **calm, well-informed friend at the pub** explaining the situation to someone who's only half-paying-attention. It never shows off, never uses jargon, and never makes you feel stupid for not knowing the rules.

### Person and address
- Speaks *about* the team in the third person ("England are...", "they've done enough...")
- Speaks *to* the reader in the second ("We'll tell you...", "your team")
- Never "I". Occasional "we" for the product itself.

### Casing is meaningful, not decorative
| Element | Case | Why |
|---------|------|-----|
| Status label | `UPPERCASE` Saira Condensed | The only shouting. Stadium scoreboard. |
| Wordmark | `lowercase` DM Mono | Quiet brand confidence |
| Kicker labels (GROUP C, LIVE) | `UPPERCASE` DM Sans | Broadcast data-label convention |
| All prose sentences | Sentence case | Human, warm, readable |

### Sentence style
- Short sentences. One idea each. Full stops.
- No numbers unless they *are* the answer: "6th of 12 third-placed teams. The top 8 go through."
- Emotional, not statistical. The AI explainer ends on a one-word all-caps verdict on its own line: **RELAX** or **NERVOUS**.
- No emoji in copy (only as team identity via flag emoji — never 🎉/🔥/⚽ in sentences).

### Representative copy (from the real product)
| Element | Copy |
|---------|------|
| Screen 1 heading | *"Which team are you following?"* |
| Screen 1 subtitle | *"For people who are half-watching."* |
| Search placeholder | *"Search your team…"* |
| Notify trigger | *"Notify me the moment it's decided"* |
| Notify success | *"You're on the list — we'll email you the moment it's decided."* |
| AI trigger | *"Wait, what does this mean?"* |
| Footer | *"stillin.app · for people who are half-watching"* |
| THROUGH message | *"Brazil are through to the Round of 32."* |
| OUT message | *"It's over — the USA are out of the World Cup."* |

---

## VISUAL FOUNDATIONS

**Overall feeling:** Apple Sports' restraint × an Apple TV broadcast scoreboard × WC2026 official polish. Premium, sporty, clean. White space does the calming; the status card does the shouting.

### Colour
- **Page background:** pure white `#FFFFFF` — flat, no gradients, no texture. All colour enters through the status card and the gold wordmark.
- **Brand gold `#C9A84C`:** an antique/trophy gold (muted, not neon). Reserved for the wordmark, interactive elements (share button fill, search focus ring, qualify-meter pip), and the AI gradient.
- **Status fills:** deep, confident, medium-saturation solids. White text on all four. The fill *is* the statement — no borders needed on the card to communicate the state. A `1px solid rgba(201,168,76,0.4)` gold hairline ties every card back to the brand.
- **Tint tokens** (`--through-tint`, `--hanging-tint`, etc.) exist for compact/inline list treatments but are *not* used on the hero card.
- **AI gradient:** `linear-gradient(90deg, #C9A84C → #9B6FD4)` gold-to-purple — applied exclusively to the "✦ Wait, what does this mean?" explain link. This is the 2025–26 visual convention for AI-generated content; use it nowhere else.

### Typography
Three families, strict role separation:

| Family | Weight | Role | Never use for… |
|--------|--------|------|----------------|
| **Saira Condensed** | 900 only | Status labels (`HANGING ON`, `THROUGH`, etc.) | Headings, body, labels |
| **DM Sans** | 400/500/600/italic | Everything else — headings, labels, kickers, body, meta | Status labels |
| **DM Mono** | 500 | The "still in?" wordmark and nothing else | Any other text |

The **status label** is always the biggest element on screen — `clamp(64px, 22vw, 92px)` on the hero card. This is intentional: it reads like a stadium scoreboard, answering the question before you read a single word.

### The status card
The product's signature element. Rules:
- **Fill:** flat solid colour (no gradient), one of the four canonical fills.
- **Depth gradient:** `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.22) 100%)` as an absolute overlay — gives depth and makes the white label pop at the bottom of the card.
- **Border:** `1px solid rgba(201,168,76,0.4)` gold hairline — the brand's constant presence.
- **Radius:** `var(--r-card)` = 12px — tight corners, scoreboard not modal.
- **Shadow:** `var(--shadow-hero)` = `0 8px 40px rgba(0,0,0,0.14)` — lifts off the white page.
- **Flag:** 48px, `drop-shadow(0 4px 10px rgba(0,0,0,0.32))` — national identity, proud.
- **Live heartbeat:** a dot (`animation: lpulse 1.6s ease-in-out infinite`) + expanding ring, on HANGING ON / IN DANGER only. Hidden for THROUGH and OUT.
- **Qualify meter:** 12 horizontal cells, qualify-zone cells at 30% white alpha, out-of-zone at 13%, gold pip on the team's current rank, white 2px cut-line after cell 8 (the qualification boundary).

### Borders and lines
- Hairlines: warm light grey `#E7E5E0`
- Inputs: `1.5–2px` border, goes **near-black `#0A0A0A`** on focus with `0 0 0 4px #F4ECCF` gold-soft ring
- Pills: `1.5px` hairline darkening to ink on hover

### Radii
| Token | Value | Used for |
|-------|-------|---------|
| `--r-card` | 12px | Status cards, dropdown popovers |
| `--r-input` | 14px | Search field, email input |
| `--r-btn` | 13px | All action buttons |
| `--r-pill` | 999px | Team pills, live badge |

### Shadows / elevation
| Token | Value | Used for |
|-------|-------|---------|
| `--shadow-card` | `0 4px 24px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04)` | Buttons, dropdown |
| `--shadow-hero` | `0 8px 40px rgba(0,0,0,.14)` | The status card |

No neumorphism, no coloured shadows, no hard shadows.

### Buttons
| Variant | Style | Used for |
|---------|-------|---------|
| Primary | Gold `#C9A84C` fill, dark `#1A1306` text, `shadow-card` | Share CTA |
| Secondary | Near-black `#0A0A0A` fill, white text | Notify me |
| AI text | Gold→purple gradient text + ✦ prefix | Explain / AI content |

Hover: subtle `brightness(1.05)` or `opacity(0.92)`. Press: `scale(0.97)`. Nothing bounces.

### Motion
Minimal and meaningful:
- **Live heartbeat only:** dot pulses (opacity + scale) + expanding ring, 1.6s `ease-in-out`, on live states.
- **All other transitions:** `160ms cubic-bezier(0.2, 0.7, 0.2, 1)` — border-colour, background, filter.
- `@media (prefers-reduced-motion: reduce)` disables all animations.

### Imagery and backgrounds
None. The product is entirely typographic — no photographs, no illustrations, no icon sets beyond the single search-icon SVG. The only "images" are **flag emoji** (national identity) and the occasional minimal Lucide-style stroke icon (search, share, arrow, bell, check). This deliberate emptiness is what makes the saturated status card land hard.

### Transparency and blur
Used only *on* the status card surface:
- `rgba(0,0,0,0.22)` depth overlay
- `rgba(0,0,0,0.22)` for the live pill background
- `rgba(255,255,255,0.30)` for qualify-meter cells in the qualify zone
- `rgba(255,255,255,0.13)` for out-of-zone cells

No glassmorphism over the white page background.

---

## ICONOGRAPHY

The app uses **no icon library or icon font**. All icons are inline SVG, Lucide-style (24×24 viewBox, stroke 2, round caps/joins). There are exactly four used in the UI:

| Icon | Used for |
|------|---------|
| Search (circle + handle) | Search field left adornment |
| Share / upload arrow | Share button |
| Arrow left | "← Change team" back navigation |
| Bell | "Notify me" section label |
| Check | Post-share / post-subscribe success state |

**Flag emoji** are the primary visual identity for teams — they appear at 17px in pills, 28px in compact badges, and 48px in the hero card. They are never accompanied by country names in isolation; the name always follows.

**No external icon CDN is used.** If you need more icons, match the Lucide stroke style (`stroke-width:2`, `stroke-linecap:round`, `stroke-linejoin:round`, 24×24 viewBox) from [lucide.dev](https://lucide.dev).

---

## FILE INDEX

```
/
├── README.md                      ← this file
├── SKILL.md                       ← Claude Code agent skill
├── colors_and_type.css            ← all CSS tokens + semantic type classes
├── Handoff.html                   ← ⭐ developer handoff: both screens as phone mockups
│
├── assets/
│   └── favicon.ico                ← app favicon
│
├── preview/                       ← design-system cards (registered in review pane)
│   ├── type-display.html          ← scoreboard label + display heading
│   ├── type-mono.html             ← wordmark + kicker/meta specimens
│   ├── type-body.html             ← body/lead type specimens
│   ├── color-brand.html           ← gold palette
│   ├── color-neutrals.html        ← ink scale, lines, surfaces
│   ├── color-status.html          ← four status fills
│   ├── color-status-tints.html    ← status as compact rows
│   ├── spacing-radii-elevation.html ← radii + shadows
│   ├── comp-buttons.html          ← gold / dark / AI-gradient buttons
│   ├── comp-pills-live.html       ← team pills + live badge
│   ├── comp-inputs.html           ← search + email inputs
│   ├── comp-scoreboard.html       ← all four hero status cards
│   ├── brand-wordmark.html        ← wordmark lockup rules
│   └── brand-states.html         ← flag + state mini-badges
│
└── ui_kits/stillin/
    ├── README.md                  ← (this section)
    ├── index.html                 ← ⭐ interactive app: search → status card
    ├── data.jsx                   ← team data, four states, national colours
    ├── icons.jsx                  ← inline SVG icon components
    ├── Wordmark.jsx               ← <Wordmark tone="gold|onFill" />
    ├── SearchScreen.jsx           ← Screen 1: team picker
    ├── StatusCard.jsx             ← Screen 2: hero status card
    └── App.jsx                    ← root — wires the two screens
```

---

## Quick-start for new designs

1. Link `colors_and_type.css` — all tokens and semantic type classes are ready.
2. Use Google Fonts: `Saira Condensed:wght@900`, `DM+Sans:ital,opsz,wght@...`, `DM+Mono:wght@500`
3. Status label → `font-family: var(--font-display); font-weight: 900; text-transform: uppercase`
4. Everything else → `font-family: var(--font-body)`
5. Wordmark only → `font-family: var(--font-mono); color: var(--gold)`
6. Status card fill colours: `--through-fill` / `--hanging-fill` / `--danger-fill` / `--out-fill`
7. Always add `border: 1px solid rgba(201,168,76,0.4)` (gold hairline) to status cards
8. Always add the depth gradient overlay on status cards
9. Interactive prototype: open `ui_kits/stillin/index.html` — click a team to see the full status screen
