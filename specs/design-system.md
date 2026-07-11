# Horme — Design System

Design direction for the frontend, decided during the design-exploration session (2026-07-02)
and implemented on branch `feat/frontend-horme` (merged to `main` 2026-07-03, closing #8 #9).
Supersedes the placeholder styling in the Next.js scaffold. Not covered in `project-plan.md`.

**Status: shipped.** Board, application detail, seasons, and dashboard all run on this system.
Auth pages (login/register) also rebranded. Mockups in `design-explorations/` are historical
reference only — `horme-identity.html` was the chosen direction; `application-board.html` /
`application-board-v2.html` were rejected explorations (cards, metaphor-driven directions).

**Not yet renamed:** README and repo/package metadata still say "Roster" — tracked under #12
(submission prep), not part of this design system.

## Identity

**Name: Horme** (Greek ὁρμή — the impulse to act, the onset of motion, drive toward a goal).
Replaces "Roster". Rename touches: NavBar wordmark, `<title>`/metadata, README, auth pages, package name (cosmetic). Pronounced HOR-may; wordmark drops the macron. Because it is obscure, always pair with a gloss where first seen (login/footer): *"Horme · keep the momentum."*

**Thesis:** a job hunt is **momentum** — force built application by application. The UI is *kinetic*: forward-lean, acceleration, velocity. NOT Greek-temple kitsch (no laurels/marble/gold).

## Signatures (the two memorable elements)

1. **Momentum curve** — the season plotted as an accelerating velocity line (cumulative applications over weeks), gradient stroke violet→deep-violet, draws itself left→right on load. Hero of the dashboard.
2. **Pipeline track** — per-application row of 5 nodes (Applied→Responded→Interview→Final→Offer) filled to current position. The at-a-glance stage signal on the board; pairs with the status label so color isn't the only cue.

## Color tokens

Accent = **Violet**. Defined as CSS vars in `globals.css` under `@theme inline` + `.dark`.

| Token | Light | Dark |
|---|---|---|
| accent | `#7c6bff` | `#7c6bff` |
| accent-deep | `#5b4ae0` | `#5b4ae0` |
| ink (bg) | `#f1f2f4` | `#0b0c0e` |
| surface | `#ffffff` | `#121317` |
| fg / fg-2 / fg-3 | `#14161a` / `#5c626d` / `#9aa0aa` | `#edece8` / `#8b8f97` / `#565a63` |
| line | `#e5e7ec` | `#1d1f24` |
| win (offer) | `#16a34a` | `#22c55e` |
| lose (rejected) | `#dc2626` | `#ef4444` |
| neutral (withdrawn) | `#94a3b8` | `#6b7280` |

### Status ramp — analogous hue arc anchored on violet

Monochrome shade-only ramp was rejected: adjacent stages were indistinguishable at dot/keyline
size. Instead each stage is a **distinct hue stepping through a cohesive violet-centered arc**
(periwinkle → magenta) so it still reads as one progression ("warms as you close in") while every
step is separable. Offer/Rejected/Withdrawn are semantic outliers.

| Status | Hue | Note |
|---|---|---|
| Applied | `#6d8bff` | periwinkle — cold start |
| OA | `#6b6bf5` | indigo-violet |
| Screening | `#8b5cf6` | violet (brand core) |
| Technical | `#b455e6` | violet-magenta |
| Final | `#d94fa6` | magenta — closing in |
| Offer | win green | breaks the arc = the prize; row gets a soft glow |
| Rejected | lose red | momentum stopped |
| Withdrawn | neutral grey | dimmed, name muted |

## Typography

- **Display / wordmark:** Space Grotesk 700, skewed `-8°` for forward motion (wordmark only). Section headers Space Grotesk 600.
- **Data / body / labels:** JetBrains Mono (keeps the ops-ledger density). Uppercase + letter-spacing for micro-labels.
- Load both via `next/font/google`, expose as `--font-display` / `--font-mono`.
- **Brand mark:** the Greek acute accent `´` (from ὁρμ**ή**) as the active/selected tick on controls.

## Layout & motion

- **Board = list/ledger**, not cards. Grid rows: `[status keyline] company/role · source · pipeline track · stage · age`. Left keyline colored by status.
- Row hover: `translateX(+5px)` (forward nudge) + surface tint. Focus-visible ring in accent.
- **One orchestrated load moment:** content eases in from `translateX(-14px)` with an accelerating cubic-bezier, short stagger. The impulse, made literal.
- **Quality floor (non-negotiable):** responsive to mobile (rows collapse to stacked grid), visible keyboard focus, `prefers-reduced-motion` disables all transforms/animation, dark + light both first-class.

## Application to pages

- **NavBar** (`src/components/NavBar.tsx`): Horme violet wordmark; active link uses accent + acute tick.
- **Board** (`src/app/(app)/board/`): server-rendered ledger with URL-param filter/sort (`BoardToolbar`), `AddApplication` modal, empty state.
- **Application detail** (`src/app/(app)/applications/[id]/`): fields + inline `StatusControl` (uses ramp) + `EditApplication` modal + `StageTimeline` (vertical, dot = stage status, inline stage-status changes, add-stage form).
- **Dashboard** (`src/app/(app)/dashboard/`): `MomentumCurve` hero, stat readouts, `ConversionFunnel` (CSS bars), `ActivityHeatmap`, `InsightCallout` (dismiss persists per-type in localStorage), `MilestoneList`.
- **Seasons** (`src/app/(app)/seasons/`): active season card (live stats) + `CloseSeason` modal + archived cards (cached final stats); `seasons/new` restyled to tokens.
- **Auth** (`src/app/(auth)/login`, `/register`): skewed HORME wordmark + gloss line, shared token styling.
- **Landing** (`src/app/page.tsx` → `components/landing/LandingPage.tsx`): public marketing page at `/`, gated open in `proxy.ts`'s `PUBLIC` list. Reuses `MomentumCurve`/`PipelineTrack`/`STATUS_COLOR` with an illustrative example season rather than duplicating their visuals as static markup.

### Shared primitives

- `lib/status.ts` — single source for `STATUS_COLOR` (ramp), `STATUS_LEVEL` (pipeline position), `STATUSES`/`SOURCES`.
- `lib/date.ts` — `relativeAge`, `formatDate`.
- `components/StatusBadge.tsx`, `components/PipelineTrack.tsx` — status dot/label and the 5-node pipeline signature.
- `components/ui/Modal.tsx` — shared dialog: portals to `document.body` (so an animated/transformed ancestor like `.animate-launch` can't offset a `fixed` overlay), overlay itself scrolls (centers short content, top-anchors tall content up to `90dvh`), Esc-to-close, body scroll-lock. All three app modals (`AddApplication`, `EditApplication`, `CloseSeason`) build on it.
