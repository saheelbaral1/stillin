---
name: stillin-design
description: Use this skill to generate well-branded interfaces and assets for still in?, a FIFA World Cup 2026 qualification tracker. Contains essential design guidelines, colours, type, fonts, assets, and a full UI kit for the mobile web app. Use for production code, throwaway prototypes, mocks, handoff materials, or marketing assets.
user-invocable: true
---

Read the README.md file within this skill and explore the other available files.

## Quick orientation

**still in?** is a single-purpose mobile web app: pick your team, get one bold answer about the World Cup. The four states — THROUGH, HANGING ON, IN DANGER, OUT — drive every visual decision.

Key files:
- `README.md` — full product context, content voice, visual foundations, iconography rules
- `colors_and_type.css` — all CSS tokens (colours, type, radii, shadows, motion)
- `Handoff.html` — final developer handoff showing both screens as phone mockups
- `ui_kits/stillin/index.html` — interactive click-through prototype (search → status card)

## Type system (strict roles)

| Family | Weight | Role |
|--------|--------|------|
| Saira Condensed | 900 only | Status labels (THROUGH / HANGING ON / IN DANGER / OUT) |
| DM Sans | 400/500/600 + italic | Everything else: headings, labels, body, meta |
| DM Mono | 500 | The "still in?" wordmark and nothing else |

## Status fills (canonical)

| State | Fill | Use |
|-------|------|-----|
| THROUGH | `#14532D` | Confirmed qualified |
| HANGING ON | `#92400E` | 3rd, inside top 8 |
| IN DANGER | `#7F1D1D` | 3rd, outside top 8 |
| OUT | `#1F2937` | Eliminated |

Always pair status cards with: `border: 1px solid rgba(201,168,76,0.4)` + depth gradient overlay + `box-shadow: 0 8px 40px rgba(0,0,0,0.14)`.

## If creating visual artifacts

Copy `colors_and_type.css` into your project and link it. Load fonts from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
```

Use the interactive kit components in `ui_kits/stillin/` as a reference — they are high-fidelity recreations of the real React components, written in lightweight JSX. Read `StatusCard.jsx` for the exact card structure (depth overlay, qualify meter, live pulse) and `SearchScreen.jsx` for the search + pills pattern.

## If working on production code

The real codebase is at https://github.com/saheelbaral1/stillin — read `STILLIN_MASTER.md` there for the authoritative spec. The design tokens in `colors_and_type.css` map to the Tailwind classes used in the original components; use them as a bridge.

## If the user invokes this skill without guidance

Ask them what they want to build or design. Good questions:
- Is this a new screen, a marketing asset, a social share image, or a production component?
- Which team and which state are they showing?
- Is this for the mobile app (390px) or a wider format?

Then act as an expert designer: output HTML artifacts for mocks/prototypes, or production-ready JSX/Tailwind for code.
