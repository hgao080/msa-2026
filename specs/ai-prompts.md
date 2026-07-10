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

## Session 12 — 2026-07-10 — Board sort/search rework, row polish, Roster-copy cleanup

**Prompts:**
- "Make the sort by stage an option on the frontend. Remove sort by company option. Rename \"Applied\" sort to match text displayed of \"Age\" on rows themselves. Add a seach by company name instead of the sort."
- "Make the cards also display an updated date as well as age if keeping updated as a sort"
- "Currently all the other column headers for the table are displayed on a single line except for AGE / UPDATED where it wraps. Fix this by decreasing the column size of the COMPANY / ROLE column"
- "Remoive all references on the frontend to the old applicaiton of Roster. The 2 I can notice currently are naming of \"Seasons\" and text of x in play. Happy to just name the Seasons something simple like Searches instead and remove the in play and have something simple like x applications. Happy to take suggestions as well"
- "Log into specs\"

**Generated / decided:**
- `BoardToolbar.tsx`: sort options now `pipeline` ("Stage" — exposes the existing default pipeline-level ordering explicitly), `appliedDate` (relabeled "Age" to match the row column header), `lastUpdated` ("Updated"). Removed the `company` sort button entirely; replaced it with a debounced (300ms) free-text company search input wired to a new `company` query param.
- Backend: `ApplicationsController` + `ApplicationService.GetApplicationsAsync` gained an optional `company` query param, filtering `Company.Contains(company)` (SQL Server default collation is case-insensitive, no `.ToLower()` needed).
- `ApplicationRow.tsx`: Age column now stacks the applied-date age above a smaller muted `upd {relativeAge(lastUpdated)}` line, since Updated is still a live sort option and needs a visible field to sort against.
- Column widths retuned so the widened "Age / Updated" header (76px → 120px) stops wrapping: `Company / Role` narrowed `1.6fr` → `1.3fr` in both the header grid (`board/page.tsx`) and row grid (`ApplicationRow.tsx`) — the two must stay in sync since they're separate elements, not a shared `<table>`.
- Board header's vague "`{n} in play`" replaced with "`{n} application(s)`" (singular-safe).

**Key design choices:**
- Asked before renaming "Season" — user's Roster-cleanup request assumed it was old-app leftover naming, but `specs/project-plan.md` documents Season as the deliberate core gamification concept (bounded hunt, closes with frozen stats). Presented three options (leave it / frontend-copy-only rename / full end-to-end rename); user chose to leave "Season" untouched and scope the cleanup to just the "in play" text. Grepped the whole frontend for literal "roster" afterward — no other leftovers found.
- Company sort was redundant with the visible Company/Role column (sorting doesn't help you *find* one, searching does) — replacing it with search rather than keeping both was the user's call, not an addition beyond scope.

## Session 13 — 2026-07-10 — Backend service test coverage

**Prompts:**
- "Part of the Backend requirements is to: Implement uni tests covering key backend components and functionality. Currently what tests are there are what should I be writing tests for?"
- "Write tests for all services and rename and delete stale items as appropriate"
- "Log session into specs\"

**Generated / decided:**
- Audited `Horme.Tests`: only `AuthServiceTests.cs` and a misnamed `DashboardServiceTests.cs` (actually testing the static `ApplicationStats` helper + `DashboardService.CalculateFunnel`) existed. `ApplicationService`, `MilestoneService`, `SeasonService`, `DashboardService.GetDashboardAsync`, and `InsightService` had zero coverage.
- Deleted `backend/tests/Roster.Tests` — dead pre-rename leftover, only `bin`/`obj` build artifacts, no source, not referenced in `Horme.slnx`.
- `git mv`'d the misnamed file to `ApplicationStatsTests.cs` to match its actual class.
- Added `ApplicationServiceTests.cs` (CRUD, cross-user 404 scoping, stage lifecycle, offer/withdraw transitions, sort/filter, bad-enum → `BadRequestException`), `MilestoneServiceTests.cs` (per-slug unlock conditions, no double-unlock), `SeasonServiceTests.cs` (CRUD, close-season stat snapshot, double-close guard), a rewritten `DashboardServiceTests.cs` covering the full `GetDashboardAsync` (stats aggregation, heatmap range, milestone status mapping — not just the static helper), and `InsightServiceTests.cs` (each rule condition + priority ordering).
- All 63 tests pass (`dotnet test Horme.Tests/Horme.Tests.csproj`).

**Key design choices:**
- EF Core's `HasData` milestone seed (`AppDbContext.OnModelCreating`) only populates the InMemory provider's database after an explicit `db.Database.EnsureCreated()` call — added to the `MilestoneServiceTests`/`DashboardServiceTests` DB helpers after tests initially failed with an empty `Milestones` table.
- `InsightService`'s no-data test omits seeding a `Season` row entirely (rather than seeding one with default `WeeklyTarget`), since the day-of-week-gated `weekly-behind`/`weekly-target-hit` rules only short-circuit cleanly when the season lookup itself returns null — seeding a season made the "no insights" assertion flaky depending on real-clock day-of-week.
- A running `dotnet run` dev server (PID 7252) had `Horme.API.exe` file-locked, blocking the test build; killed after explicit user confirmation since it's a destructive-adjacent action outside the "run tests" scope.

## Session 14 — 2026-07-10 — Frontend unit test coverage

**Prompts:**
- "Part of the Frontend requirements is to: Implement unit tests covering key frontend components and functionality. Currently what tests are there and what should I be writing tests for?"
- "What should actually be tested in frontend?"
- "Setup Vitest config and begin working through all tiers starting with highest priority. Once done with a tier generate a commit message by staging all changes except for changes under specs\ and running \"/caveman:caveman-commit staged changes\" to generate the commit message to use"
- "Log session into specs\"

**Generated / decided:**
- Audited frontend: zero tests existed, Vitest not installed despite `package.json`/HANDOFF specifying it.
- Installed `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`; added `vitest.config.ts` (jsdom env, `@/` alias), `vitest.setup.ts`, and a `test` script.
- Tier 1 (`src/lib/` pure functions): `date.test.ts` (`relativeAge` day-boundary cases, `formatDate` invalid/empty), `status.test.ts` (`pipelineLevel` stage-precedence, `sourceLabel` fallback), `api.test.ts` (`toQuery`/`query` param serialization, `apiFetch` auth header, `ApiError` on non-ok, 204 handling) — 25 tests.
- Tier 2 (dashboard visualizations named in HANDOFF): `ConversionFunnel`, `ActivityHeatmap`, `InsightCallout`, `MomentumCurve` — bar-width math, zero-division floors, weekday-padding, localStorage dismiss persistence — 13 tests.
- Tier 3 (interactive components): `StatusControl`, `BoardToolbar`, `MilestoneList` — server actions and `next/navigation` mocked so button clicks, URL param pushes, and the company-search debounce assert without hitting the network — 11 tests.
- All 49 tests pass (`npx vitest run`). Three commits, one per tier, `specs/` excluded from each per session request.

**Key design choices:**
- `apiFetch` tests mock `next/headers`'s `cookies()` rather than hitting real cookie storage, since it's a server-only API unavailable in the jsdom test environment.
- `BoardToolbar`'s debounce test uses `fireEvent.change` + `vi.useFakeTimers()` instead of `userEvent.type`, since `userEvent`'s internal timer usage under fake timers caused the test to hang/timeout.
- `ActivityHeatmap`'s weekday-padding test computes the expected lead-cell count via the same `new Date(date).getDay()` call the component uses, rather than hardcoding a day-of-week, to avoid timezone-dependent flakiness across machines.
- `StatusControl` mocks the `'use server'` actions module entirely (`vi.mock('@/app/(app)/applications/[id]/actions')`) rather than letting clicks reach real `apiFetch` calls.

## Session 15 — 2026-07-10 — Dashboard audit + Admin/RBAC removal

**Prompts:**
- "Currently what does the frontend dashboard show and what does the backend services supporting this functionality provide? Is it all being utilized?"
- "Remove admin entirely. Not needed. Update and specs or your memory as needed. After doing so audit your memory against the current codebase and update anything relevant"

**Generated / decided:**
- Audited dashboard: frontend renders stat tiles (totalApplications, weeklyProgress/Target, currentStreak, responseRate), InsightCallout (topInsight only), client-computed MomentumCurve, ActivityHeatmap, ConversionFunnel, MilestoneList. Backend `DashboardDto` also returns `totalInterviews`, `longestStreak`, and `personalBests` — all computed server-side but never rendered. `/api/seasons/{id}/insights` (full insight list) and `/api/admin/stats` were fully unused end-to-end.
- Flagged that `AdminController`/`AdminOnly` policy was the only place the graded "RBAC (Admin/User roles)" advanced requirement was exercised before deleting it — user chose to drop RBAC as a chosen advanced requirement rather than keep or wire it up.
- Removed entirely: `AdminController.cs`, `AdminStatsDto`, `AdminOnly` authorization policy, `User.Role` column (new EF migration `RemoveUserRole`), `Role` JWT claim, `UserDto.Role`, frontend `User.role` type field.
- Backend build + `dotnet test` (63/63) and frontend `tsc --noEmit` + `vitest run` (49/49) all pass post-removal.
- Updated `specs/project-plan.md` (Advanced Requirements list, JWT rationale) and `specs/HANDOFF.md` (repo tree, entity model, endpoint spec, RBAC example, Program.cs snippet, build order, frontend `User` type) to drop Admin/RBAC references.
- Left `totalInterviews`/`longestStreak`/`personalBests` stat fields and the `/insights` endpoint as known-unused-but-not-removed (out of scope for this session — only admin removal was requested).

**Key design choices:**
- Regenerated the EF migration via `dotnet ef migrations add` rather than hand-editing the existing `InitialCreate` migration/snapshot, since no local DB file existed yet to make in-place editing safe, and hand-editing designer/snapshot files by hand risked missing a spot (User.Role vs Application.Role share the property name).
- Had to stop a running `Horme.API.exe` dev server (locked build output) before the build/migration would succeed — confirmed with the user before killing the process.

## Session 16 — 2026-07-10 — Azure deploy options + Dockerize project

**Prompts:**
- "I want to deploy my backend on Azure. What options do I have? ..."
- "I am no longer using SQLite where did you get this information from? Update stale references"
- "An advanced requirement I could aim to tick off is: 'dockerize your project using docker' though I do not want to do this for the sake of doing this. What advantages and disadvantages does dockerizing my project bring"
- "How would deployment look if I did dockerize my project? Are frontend and backend and db still all separate deployments?"
- "So my local development would no longer be using an installation of localdb on my pc but instead an installation of localdb in a container?"
- "So LocalDB only works on windows"
- "Could you dockerize my project then before I go into deployment"

**Generated / decided:**
- Discussed Azure backend hosting options (App Service direct deploy, App Service containerized, Container Apps, AKS, ACI) and Docker tradeoffs (assessment-requirement credit + portability vs. extra build/ops surface for a low-traffic app).
- Found and fixed stale `SQLite` reference in `CLAUDE.md` Stack line (project moved to SQL Server back in Session 11; CLAUDE.md was never updated) — now reads `SQL Server`.
- Clarified LocalDB is Windows-only (no Linux/container build exists); a dockerized setup replaces it with a real SQL Server container for local dev, not "LocalDB in a container."
- Dockerized the full stack:
  - `backend/Horme.API/Dockerfile` — multi-stage `dotnet/sdk:10.0` build → `dotnet/aspnet:10.0` runtime, port 8080, `.dockerignore` added.
  - `frontend/Dockerfile` — multi-stage pnpm build using `output: "standalone"` (added to `next.config.ts`), `.dockerignore` added.
  - `docker-compose.yml` (repo root) — `db` (`mcr.microsoft.com/mssql/server:2022-latest` with healthcheck), `api` (env-var-overridden connection string, waits on `db` healthy), `web` (`HORME_API_URL=http://api:8080`).
  - `.env.example` for `SA_PASSWORD` / `JWT_KEY`; real `.env` already covered by existing root `.gitignore`.
- Verified end-to-end: `docker compose build` (both images), `docker compose up` (db healthy, api auto-migrates + seeds via existing `Program.cs` logic), `POST /api/auth/login` against the containerized stack returned 200 + valid JWT, frontend `/login` returned 200.
- Fixed a build error found during verification: Dockerfile assumed a `frontend/public/` directory that doesn't exist in this project — removed that `COPY` line.
- Flagged (not changed, out of scope): root `.gitignore` still has a stale `# SQLite databases` block from before the Session 11 SQL Server migration.

**Key design choices:**
- Kept `appsettings.json`'s `(localdb)` connection string untouched for non-Docker local dev — Docker Compose overrides it purely via `ConnectionStrings__DefaultConnection` env var (12-factor style), no new `appsettings.Docker.json` needed.
- Did not containerize the database for Azure deployment — recommended **Azure SQL Database** (managed) in prod, container `db` service is local-dev-only, matching the existing `UseSqlServer` provider with no code change.
- Recommended App Service direct (non-container) deploy as the default Azure target for this project's scope, with Docker treated as a requirement-checkbox win rather than an operational necessity at this scale.

## Session 17 — 2026-07-10 — Azure deployment: Entra-only SQL, ACR, App Service (backend + frontend)

**Prompts:**
- "Now that I have containerized both. Let me begin with deploying the backend. Should I setup Azure SQL first"
- "Can I not use Microsoft Entra-only?" / "Go Entra-only. What do I need to do"
- "Could you dockerize my project then before I go into deployment" (installed Azure CLI, ACR push)
- "Ok let's just use ACR" / "ACR created" / "Do you need ACR or docker hub to deploy a container?"
- "Yes go ahead" (App Service creation, Managed Identity wiring)
- "Done, go ahead" / "check the logs" / "I think the issue is there is no user. What command do I need to run?"
- "So what is the error with the deployment?" / pasted log stream showing `CREATE TABLE permission denied`
- "Move onto the frontend deployment"
- "Do I not need to wire up the environment variables in Azure?"
- "Nevermind seems to work though it is slightly slow and unresponsive. Will it be slow on initial launch because containers spin down to 0 when inactive?"
- "What was the reason we didn't go with Container Apps?"
- "Don't change any settings. Could you just go find the configuration for my frontend, backend and sql deployments and verify where the slow start is actually occurring"
- "Will disabling auto-pause on the SQL instance introduce more costs?" / "Enable Always On on both"
- "I should have the Free database offer applied. What does this give me"

**Generated / decided:**
- Deployed full stack to Azure, resource group `msa-2026` (australiaeast): `horme-sql` (Azure SQL logical server, **Microsoft Entra authentication only** — no SQL login exists), `Horme` database (`GP_S_Gen5` Serverless, free-limit offer applied), `horme` ACR (Basic, admin disabled), `horme-plan` (Linux, B1) hosting both `horme-api` and `horme-web` Web Apps for Containers.
- Passwordless end-to-end: both Web Apps use **System-assigned Managed Identity** for ACR image pulls (`acrUseManagedIdentityCreds=true`, `AcrPull` role) and the backend uses the same identity for SQL access (`Authentication=Active Directory Managed Identity` in the connection string, granted via `CREATE USER [horme-api] FROM EXTERNAL PROVIDER` + `db_datareader`/`db_datawriter`/`db_ddladmin` roles run in Azure Portal Query Editor as the Entra admin).
- Installed Azure CLI (`winget install Microsoft.AzureCLI`) mid-session since Portal-only setup couldn't push local Docker images; used it for all subsequent resource creation/config. Windows/Git-Bash quoting broke `az` calls with long `--scope` arguments (`'C:\Program' is not recognized`) — switched those specific calls to the PowerShell tool, which handled the same paths/arguments natively.
- Debugged two real deployment failures in sequence (both surfaced as Azure's generic `ContainerTimeout` / exit code 139, which is misleading):
  1. `Microsoft.Data.SqlClient 5.1.6` (pulled in transitively via `EFCore.SqlServer 9.0.6`) — bumped to `7.0.2` while chasing a suspected OpenSSL/native-SNI crash theory; required also bumping `System.IdentityModel.Tokens.Jwt` to `8.16.0` to resolve a downgrade conflict. This did not fix the real issue but was a legitimate version bump kept in place.
  2. Real root cause: SqlClient 7.x split Entra ID auth providers into a separate package — `Authentication=Active Directory Managed Identity` threw `Cannot find an authentication provider for 'ActiveDirectoryManagedIdentity'` at startup (inside `db.Database.Migrate()`, before Kestrel binds to the port, which is why Azure reported it as a container-timeout crash rather than a clean error). Fixed by adding `Microsoft.Data.SqlClient.Extensions.Azure 7.0.2`. Confirmed by reproducing the exact stack trace locally via `docker run` with the same connection string — proved it wasn't a segfault before spending more time on native-library theories.
  3. Follow-up permission error once the app could actually reach SQL: `CREATE TABLE permission denied` — the Managed Identity's initial grant (`db_datareader`/`db_datawriter` only) didn't cover EF Core's migration DDL; fixed by granting `db_ddladmin` too.
- Deployed frontend the same way: `horme-web` Web App, own Managed Identity + `AcrPull` grant, `HORME_API_URL=https://horme-api.azurewebsites.net` app setting; updated backend's `Frontend__Url` app setting to the deployed frontend origin for CORS.
- Investigated a "slow/unresponsive" report post-deploy: confirmed (read-only, `az ... show` calls, no changes) that App Service B1 does **not** scale to zero (that's Container Apps behavior, not what's deployed) — the real cause was `alwaysOn: false` on both Web Apps (off by default even at Basic tier), which unloads the app after ~20 min idle. Also flagged Azure SQL Serverless auto-pause (`autoPauseDelay: 60` min) as a secondary contributor. User approved enabling Always On on both apps (free at Basic tier, no cost impact); left SQL auto-pause untouched after explaining it interacts with the DB's **free-tier offer** (`useFreeLimit: true`, 100k free vCore-seconds/month, `freeLimitExhaustionBehavior: AutoPause`) — disabling idle auto-pause would burn the free quota faster and still end up auto-paused via quota exhaustion instead, with no net benefit.

**Key design choices:**
- Chose Entra-only SQL auth and Managed-Identity-based ACR pulls over SQL-auth/admin-user credentials specifically to avoid any stored password anywhere in the deployed chain, at the cost of extra one-time setup (Managed Identity role grants, Query Editor T-SQL, Windows CLI quoting friction) — user explicitly opted into this tradeoff over the simpler SQL-auth path.
- Diagnosed by reproducing failures locally (`docker run` with the same env vars/connection string) rather than guessing from Azure's opaque `ContainerTimeout`/exit-139 platform logs — this is what turned a segfault-chasing detour into a five-minute fix once tried.
- Did not act on the SQL Serverless auto-pause / disable-auto-pause question — explained the free-tier interaction and let the user decide; no change made there this session.

## Session 18 — 2026-07-11 — Dockerized dev workflow + HMR verification

**Prompts:**
- "My frontend and backend should all be containerized though also supporting non-containerized development if wanted with the backend using localdb. When using the containerized workflow is there any support for hot module reloading?"
- "What setup would you suggest?"
- "Realistically I'm never gonna be booting up a prod version locally so I am happy to override all the docker configuration present to be focused on local development first"
- "yeah spin it up and check HMR works"

**Generated / decided:**
- Added a `dev` build stage to both `frontend/Dockerfile` and `backend/Horme.API/Dockerfile`, placed *before* the existing prod stage so CI's plain `docker build` (no `--target`, defaults to last stage) still builds the prod image unchanged. `docker-compose.yml` now targets `dev` directly with bind mounts (`./frontend:/app`, `./backend/Horme.API:/src`) plus anonymous volumes over `node_modules`/`.next`/`obj`/`bin` so container-built deps aren't shadowed by the host mount. No override file — this repo will never run a local prod stack, so the base compose file is dev-only by design.
- Verified backend HMR works out of the box: `dotnet watch run` picked up a `Services/AuthService.cs` edit instantly. One real fix needed: the edit was a Roslyn "rude edit" (await-expression change), which triggers an interactive y/n restart prompt — with no TTY attached to a detached compose container this hangs forever. Added `--non-interactive` to the `dotnet watch` command so rude edits auto-restart instead of hanging.
- Verified frontend HMR does **not** work with Turbopack (`next dev`, the default in this Next 16 build): confirmed via three independent tests (host-side edit, `docker exec sed` edit, and a bare `touch` from inside the container) that route recompilation never fires, even after 30+ second waits — only a full `docker compose restart web` picks up new content. Editing `next.config.ts` itself did trigger Turbopack's separate config-watcher restart, isolating the bug to the route/app-directory watcher specifically, not the bind mount (reads via `docker exec cat` always reflected fresh content instantly) and not Windows/WSL2 propagation lag. Consistent with `frontend/AGENTS.md`'s warning that this Next build has undocumented breaking changes from training data.
- Fix: switched the frontend dev `CMD` to `next dev --webpack`. Re-tested the same live-edit flow — webpack's watcher (still `WATCHPACK_POLLING`-driven) picked up the change and logged `○ Compiling /login ...` within seconds, no restart needed. Also added `watchOptions.pollIntervalMs: 300` to `next.config.ts`, gated on `WATCHPACK_POLLING === "true"` so bare-metal `pnpm dev` outside Docker doesn't poll unnecessarily.
- Spun up the full stack (`docker compose up -d --build`) to run all of the above as live tests against real endpoints (`/login` page content, `POST /api/auth/login`), not just log-reading; reverted every test marker string afterward and tore the stack down (`docker compose down`) at the end.

**Key design choices:**
- Kept prod stages last in both Dockerfiles specifically so the Azure deploy workflow (`.github/workflows/deploy.yml`, plain `docker build <dir>` with no target flag) needed zero changes — dev-focused compose and prod CI build off the same Dockerfiles without conflicting.
- Diagnosed the Turbopack HMR failure by isolating variables one at a time (bind-mount read check → container-native touch → container-native content edit → config-file edit) rather than guessing at a Docker/Windows explanation first, since the obvious suspect (bind-mount propagation) was disproved early by the `exec cat` check reflecting changes instantly.
- Chose `--webpack` over further Turbopack debugging (e.g. patching the Rust watcher, filing upstream) per user's explicit choice when offered the tradeoff — prioritizes a working local dev loop now over chasing what's likely a Turbopack/Next 16 bug.

Each Claude Code session, append a new `## Session N` block with:
- Date
- Each distinct prompt (copy or summarise — exact wording preferred)
- What was generated or decided
- Any issues or deviations from the plan

This file is submitted as evidence of AI-assisted development.
