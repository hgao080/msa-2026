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

## Session 6 — 2026-07-03 — Demo user seeding on startup

**Prompts:**
- "I'd like the backend to seed and reset a dummy user into the db on backend start. The dummy user should contain all the information needed to populate the frontend well. Concerns I have about the feasibility of this approach is how to handle auth. What do you think?"

**Generated / decided:**
- `Data/DataSeeder.cs`: `SeedDemoUserAsync` wipes and reseeds a fixed-GUID demo user (`demo@roster.dev` / `demo1234`) on every startup — one active Season, 20 Applications spread across all statuses/sources with matching ApplicationStage progressions, DailyActivity rows (9-day streak + applied-date coverage for the heatmap), 5 unlocked UserMilestones.
- Wired into `Program.cs` right after `db.Database.Migrate()`.
- Verified end-to-end: built, ran with a clean SQLite db, logged in as demo user via `/api/auth/login`, confirmed `/api/seasons`, `/api/seasons/{id}/applications`, `/api/seasons/{id}/dashboard` all return populated, coherent data.

**Key design choices:**
- No auth bypass needed — dummy user gets a normal BCrypt password hash, logs in through the existing `/auth/login` flow like any real user. The "how to handle auth" concern turned out to be a non-issue.
- Reset scope is narrow: only rows tied to the fixed demo `UserId` are deleted and reseeded; real users' data is never touched.
- Runs in all environments (not gated to Development) — deliberate choice so the deployed demo (Railway) always has fresh, populated data for reviewers/graders.
- Fixed hardcoded GUIDs for demo User/Season (pattern matches existing milestone seed GUIDs) — never `Guid.NewGuid()` in seed data, per CLAUDE.md.

---

## Session 7 — 2026-07-03 — Derive application status from stages

**Prompts:**
- "Currently a user has to add a stage and then update the application status. I think the experience would be nicer if we just allow adding stages to an application and have the application status be a display field that is automatically updated when adding stages. Plan out the necessary backend changes to support this"
- "Can probably drop the 'Final' stage and I have a concern regarding the 'Offer' stage and it having statuses. Maybe offer being in the same bucket as withdrawn or applied makes sense"
- "Happy for you to start implementing. Make Offer have the most precedence. Make an appropriately named branch and incremental commits as you make progress, staging all changes then running '/caveman:caveman-commit staged changes' to generate the commit message"
- "commit and continue" (×3, after each incremental chunk)

**Generated / decided:**
- Branch `feature/derive-application-status-from-stages`.
- Merged `StageType`/`ApplicationStatus` into one aligned enum set (`OA, PhoneScreen, Technical, Behavioural` as stages; `Applied, OA, PhoneScreen, Technical, Behavioural, Offer, Rejected, Withdrawn` as statuses). Dropped `Final` — Technical/Behavioural rounds cover it.
- `Application` gets `OfferedAt`/`WithdrawnAt` (nullable timestamps) — Offer and Withdrawn are terminal flags, not stages, since neither has a real Upcoming/Completed/Failed lifecycle.
- `ApplicationStage` gets `CreatedAt` to determine "latest stage" deterministically.
- New `ApplicationStats.ComputeStatus(Application)`: Offer > Withdrawn > latest stage (Failed → Rejected) > Applied. Called from `AddStageAsync`/`UpdateStageAsync`/offer/withdraw endpoints — the manual status-sync step is gone.
- Removed `PATCH /applications/{id}/status`; added `POST`/`DELETE` `.../offer` and `.../withdraw`.
- Rewrote `DataSeeder` to build stages first and derive status via `ComputeStatus`, so seed data can't drift from the real derivation logic.
- Migration `ConsolidateStagePipeline` (new columns only — reseed-on-every-startup means no real data to remap through the enum reshuffle).
- Frontend: `StatusControl` swapped from a free-text status `<select>` to a read-only derived-status badge + Offer/Withdraw toggle buttons; `StageTimeline`'s stage-type picker drops `Final`; CSS status-ramp vars renamed (`--st-screening` → `--st-phonescreen`, `--st-final` → `--st-behavioural`).

**Key design choices:**
- Multiple ambiguous design points surfaced via `AskUserQuestion` before implementing (StageType↔ApplicationStatus mapping for `Behavioural`, and how terminal Offer/Rejected/Withdrawn statuses get set once the pipeline is derived) — this is what led to the Offer/Withdrawn-as-flags design instead of trying to cram them into the stage lifecycle.
- Writing `ComputeStatus` tests before wiring it into the service caught two real bugs pre-merge: (1) `(ApplicationStatus)latest.Type` was an unsafe ordinal cast — `Applied` occupies ordinal 0 with no `StageType` counterpart, so every value was off by one (fixed with `Enum.Parse` by name); (2) `app.Stages.Add(stage)` alone didn't reliably mark the new `ApplicationStage` as `Added` in EF's change tracker, causing `SaveChanges` to emit an `UPDATE` against a nonexistent row (`DbUpdateConcurrencyException`) — fixed by adding through `db.ApplicationStages.Add(stage)` instead, relying on EF's relationship fixup to reflect it back into `app.Stages`.
- Verified via a live smoke test (ran the API, seeded fresh, logged in as the demo user, exercised add-stage/offer/withdraw over HTTP) rather than trusting build+unit-tests alone — this is what surfaced the EF tracking bug above, which the unit tests (in-memory objects, no real `SaveChanges`) couldn't have caught.

---

## Session 8 — 2026-07-03 — Edit and delete stages

**Prompts:**
- "Some things I would still like to brush up are making it so that a user can edit or delete stages. Make the backend changes then follow with the frontend changes. Use the same process as earlier to accomplish task"
- "commit and continue" (×2)

**Generated / decided:**
- `UpdateStageRequest` gains `Type`/`ScheduledDate` so an existing stage can be fully corrected (not just status/notes as before).
- New `ApplicationService.DeleteStageAsync` + `DELETE /applications/{id}/stages/{stageId}`; both edit and delete recompute `Application.Status` via `ComputeStatus` afterward, so deleting the latest stage correctly falls back to whatever stage is now latest, or `Applied` if none remain.
- Frontend: `StageTimeline`'s per-stage row (`StageRow`) now toggles into an inline edit form (type/scheduled date/notes) and has a delete button behind a native `confirm()` prompt. `lib/applications.ts` gets `deleteStage`; `updateStage`'s data shape extended to match.

**Key design choices:**
- Applied the same process as session 7: plan the assumption inline (edit = Type/ScheduledDate/Notes; status stays on the existing picker), implement backend first, verify with build + `dotnet test` + a live smoke test (add two stages, edit one's type, delete both, confirm `status` falls back correctly at each step) before touching the frontend.
- `DeleteStageAsync` explicitly calls both `db.ApplicationStages.Remove(stage)` and `app.Stages.Remove(stage)` — the latter isn't strictly required for EF to issue the right `DELETE`, but it guarantees the in-memory `app.Stages` collection used by `ComputeStatus` is correct immediately, without depending on fixup timing. Deliberate defensiveness after the session 7 lesson about `Add`-only navigation mutations not being reliably tracked.
- No new milestone/activity side effects on delete — removing a stage isn't a forward-progress action, so it doesn't call `LogActivity` or `CheckAndUnlockMilestones` (unlike add/edit, which still do).
- Confirm-before-delete uses a plain `window.confirm()` rather than a custom modal — matches the scope of a "brush up," not a UI redesign.

---

## Session 9 — 2026-07-03 — Pipeline progress by furthest stage reached

**Prompts:**
- "I quite like the pipeline feature and think it would make sense to default order applications by how far they are into the pipeline. I think we should make it so that if there exists an OA or phone screen stage then progress to 2nd dot. If technical 3rd. If behavioural 4th dot. ... the only change is just making it based off what exists as opposed to most recent stage ... make a branch and begin work, committing at appropriate increments"

**Generated / decided:**
- Branch `feature/pipeline-progress-sort`.
- Backend: `ApplicationStats.PipelineLevel(Application)` returns 1–5 from which stage *types* exist on the application (OA/PhoneScreen → 2, Technical → 3, Behavioural → 4, `OfferedAt` set → 5), independent of `ComputeStatus`'s most-recent-stage logic. New `"pipeline"` sort key in `ApplicationService.GetApplicationsAsync` (also the wildcard/default case); `"appliedDate"` split out as its own explicit case since it no longer owns the default branch.
- Frontend: `lib/status.ts`'s `STATUS_LEVEL` (keyed off derived `status`) replaced with `pipelineLevel()`, mirroring the backend's furthest-stage-type logic directly off `app.stages`/`app.offeredAt`. `PipelineTrack` now takes `stages`/`offeredAt` instead of deriving level from `status`. Board page's default `sort` param changed from `appliedDate` to `pipeline`; `BoardToolbar`'s local default updated to match so no sort button is falsely highlighted as active.

**Key design choices:**
- Root cause: `Application.Status` is derived from the *most recently added* stage (session 7's `ComputeStatus`), so adding stages out of chronological order (e.g. a Technical round logged, then a follow-up OA added later) could make the pipeline dots regress. Pipeline-level is now computed independently of `status` — from the *set* of stage types present — so it only moves forward.
- Left `ComputeStatus`/the status badge untouched — user asked specifically about the pipeline dots and sort order, not the status label itself.
- Default sort order stays `desc` (furthest-along applications first), reusing the existing `order` param default rather than introducing a new one.

## Session 10 — 2026-07-04 — Flatten backend project structure

**Prompts:**
- "I want to fix my backend folder, project and solution structure. I am a bit lost as to when to use projects vs folders and what are the tradeoffs for each ... if continuing this way, I would like to lose the src and tests folder as they are essentially meaningless just holding a project in each. What is your recommendation?"
- "branch and go ahead. Remove stale files and make incremental commits as you go by staging changed files and calling caveman commit on those staged changes to generate the commit msg"
- "Update any stale docs and anything necessary to update in specs/"

**Generated / decided:**
- Branch `restructure/flatten-backend-projects`.
- Moved `backend/src/Roster.API` → `backend/Roster.API` and `backend/tests/Roster.Tests` → `backend/Roster.Tests` via `git mv` (history preserved); updated `Roster.slnx` project paths and `Roster.Tests.csproj`'s `ProjectReference` (`..\..\src\Roster.API\` → `..\Roster.API\`).
- `dotnet build Roster.slnx` verified green post-move.
- `specs/project-plan.md`'s repo-structure diagram updated to match (was still showing the `src/tests` wrapper); `specs/HANDOFF.md` already showed the flat layout, so no change needed there.

**Key design choices:**
- Recommended single-project-with-folders over per-layer projects (Domain/Application/Infrastructure/API as separate `.csproj`): layered projects buy compiler-enforced dependency direction and independent build/versioning, which pays off for multi-team/swap-infra scenarios — not a solo MSA assessment project with one API + one test project. Folders (Controllers/Services/Models/DTOs) give the same readability without the ceremony.
- `src`/`tests` wrapper directories added a nesting level with no build or organizational value (each held exactly one project) — flattened to `backend/Roster.API`, `backend/Roster.Tests`.

## Session 11 — 2026-07-10 — Swap SQLite for SQL Server (LocalDB local / Azure SQL prod)

**Prompts:**
- "I want to transition the backend off of SQLite and to Azure SQL. What steps will need to be done to do so"
- "I want local SQL Server/LocalDB with Azure SQL only in prod. What do I need to setup locally on my machine?"
- "Is Local DB the suggested local development approach? Could you explore this article and summarise it for me and its relevance to our current situation: https://learn.microsoft.com/en-us/azure/azure-sql/database/local-dev-experience-overview?view=azuresql"
- "Is this only usable through the extension?"
- "From what I read this seems to the more modern and recommended approach as such I would like to learn how to adopt it. Can you begin teaching me what Dev Container Templates are?"
- "Can you explain SQL Database Projects to me"
- "Can you explain to me what migrations are and why they are necessary"
- "I have installed SQL Server 2025. Is this correct and what do you need from me to complete the swap from SQLite to SQL Server / Azure SQL"
- "How did you create the SQL Server database?"
- "Difference between SQLEXPRESS and LOCALDB"
- "I want to use LocalDB instead"
- "localdb should be installed now"
- "Could you just move the MSSQLLocalDB string into the default appsettings.json and delete Development.json. This string should be safe to push to git"
- "Log this session into specs/"

**Generated / decided:**
- Swapped EF Core provider Sqlite → SqlServer: `Horme.API.csproj` package reference, `Program.cs` `UseSqlite` → `UseSqlServer`.
- Deleted the two Sqlite-typed migrations (`InitialCreate`, `ConsolidateStagePipeline` — hardcoded `type: "TEXT"` columns incompatible with SQL Server) and regenerated a single fresh `InitialCreate` migration against the SqlServer provider (`uniqueidentifier`, `datetime2`, `nvarchar` types); milestone seed GUIDs preserved as hardcoded `Guid.Parse(...)` per CLAUDE.md rule.
- Explored Microsoft Learn's Azure SQL local-dev docs (local-dev-experience-overview, local-dev-experience-dev-containers) — evaluated Dev Container Templates + SQL Database Projects as the "modern" MS-recommended path, then explicitly decided against adopting either: Dev Containers add a Docker dependency with no benefit for solo local dev, and SQL Database Projects is a schema-first/declarative model incompatible with the repo's existing EF Core code-first migrations — rework not justified for MSA assessment scope. EF Core migrations stay as the schema mechanism.
- Local DB target churned through two options before settling: installed SQL Server 2025 Express (`SQLEXPRESS` instance) first, applied migration there; then installed LocalDB (`MSSQLLocalDB`) per user preference, re-pointed connection string, reapplied migration; dropped the now-orphaned `Horme` DB from the SQLEXPRESS instance via `Invoke-Sqlcmd` (SQLPS module) to avoid leaving stale state.
- Consolidated config: connection string moved out of a separate `appsettings.Development.json` into base `appsettings.json` and the Development file deleted — LocalDB's `Trusted_Connection=True` string has no embedded secret, safe to commit.
- Verified with `dotnet build` + `dotnet test` (19/19 pass) after every change.

**Key design choices:**
- Prod (Azure SQL) connection string is still never committed — the LocalDB string now sitting in `appsettings.json` only works locally; production must override it via `ConnectionStrings__DefaultConnection` env var / App Service config at deploy time, per CLAUDE.md's JWT-key-placeholder convention.
- Chose LocalDB over SQLEXPRESS as final local dev target: on-demand spin-up per session (no persistent background Windows service), lighter footprint, matches the standard EF Core dev pattern more closely than a full Express instance.
- Migration regeneration (delete + recreate) chosen over hand-patching the old Sqlite migration files — provider-specific column types differ enough that hand-editing risked drifting from the actual current entity model.
- Azure SQL provisioning itself (real Azure resource, prod connection string wiring) is still outstanding — only the local dev + provider-swap side is done this session.

Each Claude Code session, append a new `## Session N` block with:
- Date
- Each distinct prompt (copy or summarise — exact wording preferred)
- What was generated or decided
- Any issues or deviations from the plan

This file is submitted as evidence of AI-assisted development.
