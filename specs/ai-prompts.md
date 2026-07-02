# AI Prompts Log

Running log of prompts used with Claude Code (claude-sonnet-4-6) throughout development.
Required by MSA 2026 Phase 2 assessment.

---

## Session 1 — 2026-06-25 — Planning & Scaffold Verification

**Tool:** Claude Code (claude-sonnet-4-6)

### Prompt 1 — Project planning
> "I want to build a job application tracker with gamification for MSA 2026 Phase 2. The theme is gamification. Help me design the full architecture: database schema, API endpoints, frontend structure, tech stack, and build order."

**Output:** Full HANDOFF.md — entity models, API spec, business logic (streak calc, insight rules, milestone check, season close), Program.cs setup, frontend key patterns, Docker config, build phases.

**Key decisions made:**
- Season as first-class concept (not just a flat list)
- Insight system over points/levels (data-derived, actionable)
- SQLite for simplified deployment
- 3 advanced features: Security (RBAC + BCrypt + rate limiting), Zustand, dark mode

### Prompt 2 — Scaffold verification
> "Read HANDOFF.md to understand the details of this project. Given this I began to scaffold my repository for which I have now scaffolded a frontend\ and backend\. Verify that these scaffolds are appropriate for the task."

**Output:** Found frontend used TanStack Start (SSR) + TanStack Router instead of plain React Router. TanStack Router ≠ React Router (MSA basic requirement). Recommended rebuild.

### Prompt 3 — Frontend rebuild
> "I will remove the folder and recreate re-scaffold it. Provide me with the commands to do so."

**Output:** `Remove-Item -Recurse -Force frontend` + `pnpm create vite frontend --template react-ts`

### Prompt 4 — Scaffold re-verification
> "Verify now"

**Output:** Clean Vite React-TS scaffold confirmed. No TanStack dependencies.

### Prompt 5 — /specs setup + cross-reference
> "Cross-reference with HANDOFF.md and ensure nothing is missing from scaffold. Create /specs folder."

**Output:** This file + project-plan.md. Issues flagged below.

---

## Issues Flagged by AI

| Issue | Severity | Resolution |
|---|---|---|
| HANDOFF milestone seeds use `Guid.NewGuid()` — must be fixed GUIDs | High | Fix before first migration |
| Dockerfile references `Roster.sln` but file is `Roster.slnx` | Medium | Fix in Phase 3 |
| Frontend missing `"test"` script in package.json | Low | Add when installing Vitest |
| CORS origin hardcoded to port 5173 — new scaffold dev port may differ | Low | Verify Vite dev port, update Program.cs if needed |

---

## Session 2 — 2026-06-25 — PRD / Issue Creation

**Tool:** Claude Code (claude-sonnet-4-6)

### Prompt 1 — Cross-reference specs and create GitHub issues
> "The project has been recently scaffolded. Cross-reference HANDOFF.md and project-plan.md to ensure you understand the project scope. Ask about anything uncertain. After doing so begin splitting work out into PRDs / issues using the associated project kanban board on Github."

**Output:** Cross-referenced HANDOFF.md vs project-plan.md. Surfaced discrepancies (repo structure, React version, applicationStore gap, bestWeekApplications unspecified). Created 12 GitHub issues on Roster Project Board (project #3).

### Prompt 2 — Clarifications
> "I have refreshed gh token. Holding all should be fine for now. No objections to treating 19 as canonical. Let's go with domains."

**Output:** Confirmed choices, proceeded to create issues.

**Key decisions:**
- React 19 canonical (scaffold has 19.2.7; HANDOFF said 18)
- applicationStore holds all apps for active season in memory (no pagination for MVP)
- Issues grouped by domain (12 issues): Backend Data, Auth, Seasons/Apps, Dashboard+Insights, Admin+Tests, Frontend Foundation, Auth+Routing, Core Pages, Dashboard Page, Tests+Polish, DevOps, Submission
- Priority: P0 = Data Layer, Auth, Seasons/Apps, Frontend Foundation, Auth+Routing; P1 = Dashboard+Insights, Admin+Tests, Core Pages, Dashboard Page; P2 = Tests+Polish, DevOps, Submission

---

## Session 3 — 2026-06-26 — Backend Core Implementation (Issues #1, #2, #3)

**Tool:** Claude Code (claude-sonnet-4-6)

### Prompt 1 — Full backend implementation
> Full step-by-step instructions to build the complete backend covering issues #1, #2, #3: data layer (entities, DbContext, migrations, seeds), auth (Register, Login, JWT, BCrypt, rate limiting), and Seasons & Applications CRUD with activity logging and milestone checking.

**Generated / decided:**
- 7 model entities: User, Season, Application, ApplicationStage, Milestone, UserMilestone, DailyActivity
- 4 DTO files: AuthDtos, SeasonDtos, ApplicationDtos, DashboardDtos
- AppDbContext with composite keys for UserMilestone and DailyActivity; 11 hardcoded milestone seeds
- Custom exceptions (NotFoundException, BadRequestException, UnauthorizedException) + ExceptionMiddleware
- 6 services: AuthService, DashboardService, MilestoneService, SeasonService, ApplicationService, InsightService
- 5 controllers: AuthController, SeasonsController, ApplicationsController, DashboardController, AdminController
- Program.cs: JWT auth, fallback auth policy (all routes require auth by default), fixed-window rate limiter on auth endpoints, CORS, auto-migrate on startup
- EF Core migration: InitialCreate
- 9 unit tests across DashboardServiceTests (5) and AuthServiceTests (4); all passing

**Key design choices:**
- Fallback auth policy in Program.cs means all endpoints require authentication unless decorated with `[AllowAnonymous]`
- `LogActivity` is private to ApplicationService; called on every user-initiated write before SaveChanges
- `CheckAndUnlockMilestones` called after every SaveChanges in ApplicationService (create, status patch, add stage, update stage)
- DashboardService.CalculateCurrentStreak uses synchronous EF queries (called from MilestoneService which is already async context)
- `db.Database.Migrate()` runs at startup to auto-apply migrations including seed data
- Rate limiter uses `QueueLimit = 0` so requests over the limit are rejected immediately (no queuing)
- `ApplicationsController` uses per-route `[HttpGet/Post/...]` attributes without a class-level `[Route]` to keep nested + flat routes clean

---

## Session 4 — 2026-07-02 — Frontend migration to Next.js

**Prompts:**
- Swap frontend to Next.js; how to approach given the open frontend PR — re-scaffold manually then port from the PR or rebuild from spec?
- Locked: App Router, Next-native data layer, httpOnly cookie auth (.NET stays auth authority), rejected Better Auth.
- Scaffold created manually; port the foundation work incrementally with small staged commits, then open a PR.

**Generated / decided:**
- New branch `feat/frontend-nextjs` off `main`; Vite/React-Router foundation (PR #14) kept as source of truth, not merged.
- Ported: entity types (verbatim), server-side data layer (`lib/api.ts` fetch wrapper + season/application/dashboard modules), cookie auth (session helpers + login/register/logout Server Actions), `proxy.ts` route guard, NavBar/ThemeToggle client components, App Router route tree ((auth) + (app) groups).
- `specs/nextjs-migration.md` records the full decision + file-by-file plan.

**Key design choices:**
- Server Actions replace Axios + a client auth store for mutations; JWT lives only in an httpOnly cookie, never in client JS.
- Next 16 specifics: Middleware renamed to `proxy.ts`; `cookies()` is async; Tailwind v4 class dark mode via `@custom-variant`.
- Zustand data stores dropped — no client consumer under SSR (data fetched in server components, auth in cookies, username passed to NavBar as a prop). `zustand` dep retained for future client state.
- Server-side fetch means no CORS between browser and .NET.

---

## Session 5 — 2026-07-02 — Design direction + Frontend Core & Dashboard (Issues #8, #9)

**Prompts:**
- Tackle issues #8 and #9; grab their details, spec further if needed, and use the frontend-design skill to generate an HTML file showcasing 3 visually unique designs for the app (don't base on the current scaffold).
- Track against the Next.js layout; keep exploring designs — list format over cards, bold/unique, drop the metaphor commitment; suggest a Greek/Roman name meaning "inspire / keep going" instead of "Roster"; keep it clean like the control-room direction, no metaphors.
- Chose name **Horme** (ὁρμή). Asked how a theme built *around* the word would look.
- Locked the Horme/Momentum direction; disliked the red/orange — experiment with other accents; flip Offer to green; fix the stale CLAUDE.md line.
- Chose **Violet**; momentum ramp made stages hard to distinguish — keep the deepening idea but make them distinct.
- Proceed to spec/build; order Foundation → #8 → #9; rename visible surfaces only. Make incremental commits; use the caveman-commit skill for messages.

**Generated / decided:**
- Three exploration mockups in `design-explorations/` (rejected card + metaphor directions), landing on `horme-identity.html`.
- Design system captured in `specs/design-system.md`; product renamed Roster → Horme (visible surfaces).
- Branch `feat/frontend-horme`. Built Phase 0 (violet tokens, Space Grotesk + JetBrains Mono, NavBar, `lib/status.ts`, `lib/date.ts`, StatusBadge, PipelineTrack), #8 (board + filters/sort + add modal, application detail + StageTimeline + edit/status actions, season history + close + new-season restyle), #9 (momentum curve, stat readouts, CSS conversion funnel, activity heatmap, dismissible insight, milestone grid).
- Six staged commits; `next build` green after each phase.

**Key design choices:**
- Identity is kinetic (momentum), not Greek-temple kitsch. Signatures: momentum curve + 5-node pipeline track.
- Status ramp = analogous violet hue-arc (periwinkle→magenta) so stages stay distinguishable, with Offer=green / Rejected=red / Withdrawn=grey as semantic outliers.
- All data reads in server components via `lib/*`; mutations via Server Actions with `revalidatePath`; interactivity isolated to small client components. Read Next 16 bundled docs first per `frontend/AGENTS.md`.

---

## How to Add Entries

Each Claude Code session, append a new `## Session N` block with:
- Date
- Each distinct prompt (copy or summarise — exact wording preferred)
- What was generated or decided
- Any issues or deviations from the plan

This file is submitted as evidence of AI-assisted development.
