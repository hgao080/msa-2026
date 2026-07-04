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

**Update (2026-06-26):** Issue #15 raised to switch from SQLite to Azure SQL Database for production. SQLite file-based storage is unsuitable for hosted deployments where the filesystem is ephemeral (Railway, Azure App Service). Azure SQL gives persistent managed storage with EF Core support identical to SQLite — only the provider package and connection string change.

### JWT over session-based authentication

This is a React SPA talking to a separate ASP.NET Core API (different origin). Two options:

**Session-based:** Server stores a session record in DB. Every request looks it up by session ID cookie. Straightforward for monoliths where server and browser share the same origin — cookie `SameSite` and CSRF handling work naturally. Requires a shared session store (Redis or DB table) to survive server restarts.

**JWT (chosen):** Server signs a token on login. Client stores it and sends it as `Authorization: Bearer <token>` on every request. Server validates the signature mathematically — no DB lookup per request, no session storage. Role claim (`ClaimTypes.Role`) is embedded in the token itself, so `[Authorize(Policy = "AdminOnly")]` never touches the database.

JWT fits this architecture because:
- `Authorization: Bearer` headers work cleanly across origins without CORS cookie complexity
- No additional infrastructure (Redis, session table) needed alongside SQLite/Azure SQL
- RBAC check is free — middleware reads the role claim, no DB round trip

**Tradeoff:** Token revocation is impossible without a denylist (which reintroduces statefulness). Logout discards the client-side token but the token remains cryptographically valid until expiry (24 hours). Acceptable for Roster — no financial data, and the attack surface for stolen tokens is low. For banking or healthcare this would require short-lived tokens with refresh token rotation or a server-side denylist.

### BCrypt over ASP.NET Core Identity

Production .NET apps typically use ASP.NET Core Identity (PBKDF2 hashing, `UserManager`/`SignInManager`, email confirmation, lockout) or delegate auth entirely to an external provider (Azure AD B2C, Auth0, Entra ID).

BCrypt chosen here for three reasons:
1. **MSA visibility** — the assessment requires demonstrating security measures. Raw BCrypt makes the mechanism explicit and auditable; Identity abstracts it away.
2. **Reduced boilerplate** — Identity requires replacing `User` with `IdentityUser`, six extra migration tables, `AddIdentity<>()` setup. Disproportionate for a solo assessment project.
3. **No external IdP cost** — Auth0/Azure AD B2C have free tier limits; BCrypt + JWT needs zero additional infrastructure.

`workFactor: 12` chosen over the library default of 11: work factor is exponential (2¹² = 4096 rounds ≈ 250ms on modern hardware). OWASP recommends targeting ~250ms as the floor for new systems in 2024+. Factor 11 ≈ 130ms, which is fast enough to make offline brute force marginally cheaper. Factor 13 (500ms) introduces noticeable UX lag on login.

### DailyActivity table for heatmap/streaks
`DailyActivity` stores one row per user per active day (composite PK: `UserId + Date`, ~20 bytes/row). This powers both the streak calculation and the dashboard activity heatmap.

Alternatives considered:
- **Bitfield on User** — compact but bit manipulation is complex and querying specific date ranges is hard
- **Count column on Season** — tiny storage but loses *which* days were active; heatmap requires per-day granularity
- **Aggregate/cache table** — fast reads but requires cache invalidation on every write

The table approach is correct at MSA scale (1000 users × 365 days = ~7 MB/year). At millions of users this would move to Redis or a time-series store. Inserts are idempotent — `LogActivity` checks `AnyAsync` before inserting, so double-writes are safe.

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
│   ├── Roster.API/              # ASP.NET Core Web API
│   └── Roster.Tests/            # xUnit tests
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
