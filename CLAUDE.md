# Roster — Claude Code Instructions

## Project

MSA 2026 Phase 2 Software Stream assessment. Full-stack job application tracker with gamification.
See `specs/HANDOFF.md` for full architecture, API spec, entity schema, and build order.
See `specs/project-plan.md` for design decisions and tech stack rationale.

## Stack

- **Backend:** ASP.NET Core Web API (.NET 10), EF Core 9, SQLite, JWT, BCrypt, Scalar, xUnit + Moq
- **Frontend:** Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Server Actions, httpOnly-cookie JWT auth, Vitest. (Migrated from Vite/React-Router/Zustand — see `specs/nextjs-migration.md`.)
- **Package manager:** pnpm (frontend)
- **Backend solution:** `backend/Roster.slnx` (not `.sln`)

## Session Logging (mandatory)

At the end of every session, append an entry to `specs/ai-prompts.md` with:

```markdown
## Session N — YYYY-MM-DD — <one-line topic>

**Prompts:**
- <exact or close paraphrase of each prompt given>

**Generated / decided:**
- <what was produced or decided>

**Key design choices:**
- <any non-obvious decisions, tradeoffs, or deviations from HANDOFF>
```

Log immediately before the session ends. If unsure whether something is worth logging — log it.

## specs/ Logging Rules

Document in `specs/` whenever:
- A significant design decision is made or changed
- Code is generated for a new service, controller, component, or store
- A bug fix reveals a non-obvious constraint
- A deviation from `specs/HANDOFF.md` is agreed upon

Do **not** duplicate content already in `specs/project-plan.md`. Reference it instead.

## Code Rules

- User ID always from JWT claims — never from request body
- All Season/Application DB queries must filter by `UserId`
- Milestone seed GUIDs must be hardcoded `Guid.Parse("...")` — never `Guid.NewGuid()` in seed data
- Call `LogActivity` + `CheckAndUnlockMilestones` after every user-initiated write
- Never expose EF entities directly — always map to DTOs
- `appsettings.json` JWT key is a placeholder; never commit a real secret

## Conventions

- Backend: controllers thin, logic in services
- Frontend: API calls in `src/api/`, state in `src/store/`, types in `src/types/index.ts`
- No comments explaining what code does — only why when non-obvious
- No features beyond what HANDOFF specifies
