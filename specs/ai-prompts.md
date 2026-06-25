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

## How to Add Entries

Each Claude Code session, append a new `## Session N` block with:
- Date
- Each distinct prompt (copy or summarise — exact wording preferred)
- What was generated or decided
- Any issues or deviations from the plan

This file is submitted as evidence of AI-assisted development.
