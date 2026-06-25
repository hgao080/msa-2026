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

## How to Add Entries

Each Claude Code session, append a new `## Session N` block with:
- Date
- Each distinct prompt (copy or summarise — exact wording preferred)
- What was generated or decided
- Any issues or deviations from the plan

This file is submitted as evidence of AI-assisted development.
