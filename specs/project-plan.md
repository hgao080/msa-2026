# Roster — Project Plan

## What It Is

Season-based job application tracker with gamification mechanics. Users run a **season** (a bounded job hunt), track applications through it, and close it when done. Closed seasons archive with final stats.

Gamification = feedback loops: streaks, milestones, weekly targets, conversion funnel, activity heatmap, and an insight system that surfaces patterns from the user's own data.

Theme: **Gamification** (MSA 2026 Phase 2 requirement).

---

## Architecture Decisions

### Season as a first-class concept
Most job trackers are a flat list. Seasons give each hunt a clear start, end, and story — closing a season triggers stat caching so historical records are frozen. This is the core design differentiator.

### Insight system over points/levels
Points and levels require arbitrary scoring rubrics. Insights are derived directly from the user's data ("Referrals convert 3× better than LinkedIn for you") — more actionable, more honest, harder to game.

### SQLite over PostgreSQL
Simplifies Railway/Render deployment (no managed DB service required), sufficient for single-user data volumes, and EF Core handles it identically.

### Stats cached on season close
Dashboard recomputes live for the active season. On close, final stats (application count, response rate, interview count, offer count, streak) are written to the Season row. This keeps the history page instant with no recomputation.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | ASP.NET Core Web API (.NET 10) | MSA requirement |
| ORM | Entity Framework Core 9 | MSA requirement |
| DB | SQLite | Simple deploy, no managed service |
| Auth | JWT Bearer | Stateless, standard |
| Password hashing | BCrypt.Net-Next (workFactor: 12) | Advanced requirement: security |
| API docs | Scalar | MSA requirement (not Swagger) |
| Rate limiting | ASP.NET Core built-in | Advanced requirement: security |
| Tests | xUnit + Moq | Standard .NET test stack |
| Frontend | React 19 + TypeScript + Vite | MSA requirement |
| Routing | React Router v6 | MSA requirement |
| State | Zustand | Advanced requirement |
| Styling | Tailwind CSS | Utility-first, dark mode via `class` strategy |
| HTTP | Axios | Typed interceptors for JWT |
| Charts | Recharts | Conversion funnel visualisation |
| Tests | Vitest + @testing-library/react | Co-located with Vite |

---

## Advanced Requirements (exactly 3 chosen)

1. **Security measures** — RBAC (Admin/User roles via JWT claims), BCrypt password hashing (workFactor 12), rate limiting on auth endpoints (5 req/min fixed window). README must include security writeup.
2. **State management** — Zustand stores: `authStore` (persisted), `seasonStore`, `applicationStore`.
3. **Dark/light mode** — Tailwind `darkMode: 'class'`, toggled via `ThemeToggle` component, persisted to localStorage.

---

## Repository Structure

```
msa-2026/
├── backend/
│   ├── src/Roster.API/          # ASP.NET Core Web API
│   └── tests/Roster.Tests/      # xUnit tests
├── frontend/                    # React + Vite SPA
├── specs/                       # MSA required: AI usage, planning docs
│   ├── project-plan.md          # This file
│   └── ai-prompts.md            # Running log of AI prompts
├── README.md                    # MSA required (Phase 4)
├── Dockerfile.backend           # Phase 3
├── Dockerfile.frontend          # Phase 3
└── docker-compose.yml           # Phase 3
```

---

## Build Phases

### Phase 1 — Backend
1. Add NuGet packages (EF Core + SQLite, BCrypt, JWT, Scalar, Rate Limiting, Moq)
2. Define entities: User, Season, Application, ApplicationStage, Milestone, UserMilestone, DailyActivity
3. AppDbContext with composite keys + milestone seed data (fixed GUIDs)
4. EF migration + database update
5. AuthService + AuthController (register, login, refresh)
6. SeasonService + SeasonsController (CRUD + close)
7. ApplicationService + ApplicationsController (CRUD + status PATCH + stages)
8. DashboardService (streak, funnel, heatmap, personal bests)
9. InsightService (6 insight rules)
10. MilestoneService (check and unlock)
11. DashboardController + AdminController
12. ExceptionMiddleware (global error handling)
13. xUnit tests (AuthService, ApplicationService, InsightService, MilestoneService)
14. Program.cs final config (CORS, rate limiting, fallback auth policy, Scalar, auto-migrate)

### Phase 2 — Frontend
1. Install packages: react-router-dom, zustand, axios, recharts, tailwindcss, lucide-react, vitest, @testing-library/react
2. Configure Tailwind (darkMode: 'class')
3. src/types/index.ts — all TypeScript interfaces
4. src/api/client.ts — Axios + JWT interceptors
5. API modules: auth.ts, seasons.ts, applications.ts, dashboard.ts
6. Zustand stores: authStore (persisted), seasonStore, applicationStore
7. LoginPage + RegisterPage + ProtectedRoute
8. App.tsx with React Router setup
9. NavBar + ThemeToggle
10. ApplicationBoardPage (filters: status, source, sort)
11. ApplicationDetailPage + StageTimeline
12. DashboardPage (stats, ConversionFunnel, ActivityHeatmap, InsightCallout, MilestoneList)
13. SeasonHistoryPage + NewSeasonPage
14. Vitest tests (ConversionFunnel, ActivityHeatmap, InsightCallout, authStore)

### Phase 3 — Polish
1. Responsive layout (mobile nav drawer, responsive grids)
2. Dark mode on all components (Tailwind `dark:` variants)
3. Milestone unlock animation
4. Docker setup

### Phase 4 — Submission
1. Deploy backend (Railway) + frontend (Vercel)
2. Write README.md
3. Update specs/ai-prompts.md
4. Record 6-minute video

---

## Key Invariants

- User ID always from JWT claims (`User.FindFirst(ClaimTypes.NameIdentifier)`), never request body
- All Season/Application queries filter by `UserId`
- Milestone seed GUIDs must be hardcoded (not `Guid.NewGuid()`) for migration idempotency
- Daily activity logged on every user-initiated write
- Milestone check runs after every write that could trigger one
