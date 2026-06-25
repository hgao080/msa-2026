# Roster — Claude Code Handoff

## What You're Building

Roster is a season-based job application tracker with light gamification mechanics for the Microsoft Student Accelerator 2026 Phase 2 Software Stream assessment. The theme is **Gamification**.

A job hunt is a finite campaign, not an ongoing spreadsheet. Users create a **season**, track applications through it, and close it when they land something or take a break. Closed seasons archive with final stats — a permanent record of that hunt.

Gamification comes from feedback loops and stats visibility: streaks, milestones, weekly targets, personal bests, a conversion funnel, and an activity heatmap. No points, no levels. The key differentiator is an **insight system** that surfaces actionable patterns from the user's own data ("Referrals convert 3× better than LinkedIn for you").

---

## MSA Requirements — Do Not Miss Any

### Basic (instant fail if missing)
- [ ] Frontend: React + TypeScript
- [ ] Frontend: Visually appealing, responsive (mobile + desktop)
- [ ] Frontend: React Router navigation
- [ ] Frontend: Unit tests covering key components
- [ ] Frontend: Deployed
- [ ] Backend: C# with .NET 10+
- [ ] Backend: Entity Framework Core
- [ ] Backend: SQL or NoSQL database (SQLite)
- [ ] Backend: CRUD operations
- [ ] Backend: Unit tests covering key components
- [ ] Backend: Deployed
- [ ] Backend: Scalar API docs UI (NOT Swagger)
- [ ] Both: Regular commit history throughout development
- [ ] README: deployment links, intro, theme section, unique features, advanced checklist, self-reflection
- [ ] `/specs` folder: `.md` files documenting AI usage and prompts

### Advanced (implement exactly 3, list in README)
- [x] **Security measures** — RBAC + BCrypt password hashing + rate limiting (3 from the list)
- [x] **Dark/light mode** — theme switching
- [x] **State management** — Zustand

---

## Tech Stack

### Backend
| Concern | Choice |
|---|---|
| Runtime | C# .NET 10 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 9 |
| Database | SQLite (`Microsoft.EntityFrameworkCore.Sqlite`) |
| Auth | JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| Password hashing | BCrypt.Net-Next |
| API docs | Scalar (`Scalar.AspNetCore`) — NOT Swagger |
| Tests | xUnit + Moq |
| Rate limiting | ASP.NET Core built-in (`Microsoft.AspNetCore.RateLimiting`) |

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Routing | React Router v6 |
| State | Zustand |
| Styling | Tailwind CSS v3 (class-based dark mode) |
| HTTP client | Axios with typed wrapper |
| Charts | Recharts |
| Tests | Vitest + @testing-library/react |
| Icons | Lucide React |

### Infrastructure
| Concern | Choice |
|---|---|
| Backend deploy | Railway (with SQLite persistent volume) or Render |
| Frontend deploy | Vercel |
| Containerisation | Docker + docker-compose (advanced requirement) |

---

## Repository Structure

Single repo — MSA requires one GitHub link containing both frontend and backend.

```
roster/
├── backend/
│   ├── Roster.API/
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── SeasonsController.cs
│   │   │   ├── ApplicationsController.cs
│   │   │   ├── DashboardController.cs
│   │   │   └── AdminController.cs
│   │   ├── Models/                  # EF Core entities
│   │   ├── DTOs/                    # Request/response shapes (never expose entities directly)
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── SeasonService.cs
│   │   │   ├── ApplicationService.cs
│   │   │   ├── InsightService.cs
│   │   │   ├── MilestoneService.cs
│   │   │   └── DashboardService.cs
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   └── Migrations/
│   │   ├── Middleware/
│   │   │   └── ExceptionMiddleware.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Program.cs
│   ├── Roster.Tests/
│   │   ├── Services/
│   │   │   ├── AuthServiceTests.cs
│   │   │   ├── ApplicationServiceTests.cs
│   │   │   ├── InsightServiceTests.cs
│   │   │   └── MilestoneServiceTests.cs
│   │   └── Roster.Tests.csproj
│   └── Roster.sln
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance + JWT interceptors
│   │   │   ├── auth.ts
│   │   │   ├── seasons.ts
│   │   │   ├── applications.ts
│   │   │   └── dashboard.ts
│   │   ├── components/
│   │   │   ├── ui/                  # Primitives: Button, Badge, Card, Input, etc.
│   │   │   ├── ApplicationCard.tsx
│   │   │   ├── ConversionFunnel.tsx
│   │   │   ├── ActivityHeatmap.tsx
│   │   │   ├── InsightCallout.tsx
│   │   │   ├── MilestoneList.tsx
│   │   │   ├── StageTimeline.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── NavBar.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ApplicationBoardPage.tsx
│   │   │   ├── ApplicationDetailPage.tsx
│   │   │   ├── SeasonHistoryPage.tsx
│   │   │   └── NewSeasonPage.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── seasonStore.ts
│   │   │   └── applicationStore.ts
│   │   ├── types/
│   │   │   └── index.ts             # All TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── specs/
│   ├── project-plan.md              # Planning notes (this doc can live here)
│   └── ai-prompts.md                # Log of AI prompts used — required by MSA
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## Database Schema

### Entities

```csharp
// Models/User.cs
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // "User" | "Admin"
    public DateTime CreatedAt { get; set; }

    public ICollection<Season> Seasons { get; set; } = [];
    public ICollection<UserMilestone> UserMilestones { get; set; } = [];
    public ICollection<DailyActivity> DailyActivities { get; set; } = [];
}

// Models/Season.cs
public class Season
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public int WeeklyTarget { get; set; } = 5;
    public SeasonStatus Status { get; set; } = SeasonStatus.Active;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Outcome { get; set; }

    // Cached on season close — computed once, stored
    public int? FinalApplicationCount { get; set; }
    public double? FinalResponseRate { get; set; }
    public int? FinalInterviewCount { get; set; }
    public int? FinalOfferCount { get; set; }
    public int? FinalStreakDays { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Application> Applications { get; set; } = [];
}

public enum SeasonStatus { Active, Archived }

// Models/Application.cs
public class Application
{
    public Guid Id { get; set; }
    public Guid SeasonId { get; set; }
    public Guid UserId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? JobPostingUrl { get; set; }
    public ApplicationSource Source { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    public DateTime AppliedDate { get; set; }
    public DateTime LastUpdated { get; set; }
    public string? ReferrerName { get; set; }
    public string? Notes { get; set; }

    public Season Season { get; set; } = null!;
    public ICollection<ApplicationStage> Stages { get; set; } = [];
}

public enum ApplicationSource { LinkedIn, Seek, Referral, CompanyWebsite, Other }
public enum ApplicationStatus { Applied, OA, Screening, Technical, Final, Offer, Rejected, Withdrawn }

// Models/ApplicationStage.cs
public class ApplicationStage
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public StageType Type { get; set; }
    public StageStatus Status { get; set; } = StageStatus.Upcoming;
    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string? Notes { get; set; }

    public Application Application { get; set; } = null!;
}

public enum StageType { OA, PhoneScreen, Technical, Behavioural, Final }
public enum StageStatus { Upcoming, Completed, Failed }

// Models/Milestone.cs  (seeded — not user-created)
public class Milestone
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<UserMilestone> UserMilestones { get; set; } = [];
}

// Models/UserMilestone.cs
public class UserMilestone
{
    public Guid UserId { get; set; }
    public Guid MilestoneId { get; set; }
    public Guid SeasonId { get; set; }
    public DateTime UnlockedAt { get; set; }

    public User User { get; set; } = null!;
    public Milestone Milestone { get; set; } = null!;
}

// Models/DailyActivity.cs  — one row per active day per user
public class DailyActivity
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }

    public User User { get; set; } = null!;
}
```

### AppDbContext

```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Season> Seasons => Set<Season>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationStage> ApplicationStages => Set<ApplicationStage>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<UserMilestone> UserMilestones => Set<UserMilestone>();
    public DbSet<DailyActivity> DailyActivities => Set<DailyActivity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite keys
        modelBuilder.Entity<UserMilestone>()
            .HasKey(um => new { um.UserId, um.MilestoneId, um.SeasonId });

        modelBuilder.Entity<DailyActivity>()
            .HasKey(da => new { da.UserId, da.Date });

        // Seed milestones
        modelBuilder.Entity<Milestone>().HasData(
            new Milestone { Id = Guid.NewGuid(), Slug = "first-application", Name = "First application sent", Description = "Sent your first application" },
            new Milestone { Id = Guid.NewGuid(), Slug = "ten-applications", Name = "10 applications", Description = "Sent 10 applications" },
            new Milestone { Id = Guid.NewGuid(), Slug = "twenty-five-applications", Name = "25 applications", Description = "Sent 25 applications" },
            new Milestone { Id = Guid.NewGuid(), Slug = "first-response", Name = "First response", Description = "Received your first response" },
            new Milestone { Id = Guid.NewGuid(), Slug = "first-interview", Name = "First interview booked", Description = "Booked your first interview" },
            new Milestone { Id = Guid.NewGuid(), Slug = "five-interviews", Name = "5 interviews completed", Description = "Completed 5 interview stages" },
            new Milestone { Id = Guid.NewGuid(), Slug = "first-offer", Name = "First offer", Description = "Received your first job offer" },
            new Milestone { Id = Guid.NewGuid(), Slug = "streak-7", Name = "7-day streak", Description = "Logged activity for 7 days straight" },
            new Milestone { Id = Guid.NewGuid(), Slug = "streak-14", Name = "14-day streak", Description = "Logged activity for 14 days straight" },
            new Milestone { Id = Guid.NewGuid(), Slug = "streak-30", Name = "30-day streak", Description = "Logged activity for 30 days straight" },
            new Milestone { Id = Guid.NewGuid(), Slug = "weekly-target", Name = "Weekly target hit", Description = "Hit your weekly application target" }
        );
    }
}
```

---

## API Specification

All endpoints require `[Authorize]` except auth routes. Read user ID from JWT claims — never from request body.

```csharp
// Helper in base controller or extension
private Guid GetUserId() =>
    Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
```

### Auth

```
POST /api/auth/register
Body:    { email: string, username: string, password: string }
Returns: { token: string, user: { id, email, username, role } }

POST /api/auth/login
Body:    { email: string, password: string }
Returns: { token: string, user: { id, email, username, role } }

POST /api/auth/refresh
Header:  Authorization: Bearer <token>
Returns: { token: string }
```

### Seasons

```
GET  /api/seasons
Returns: Season[]

POST /api/seasons
Body:    { name: string, goal?: string, weeklyTarget: number }
Returns: Season

GET  /api/seasons/{id}
Returns: Season

PUT  /api/seasons/{id}
Body:    { name?: string, goal?: string, weeklyTarget?: number }
Returns: Season

POST /api/seasons/{id}/close
Body:    { outcome?: string }
Returns: Season (archived, with final stats cached)
```

### Applications

```
GET    /api/seasons/{seasonId}/applications
Query: ?status=Applied|OA|...&source=LinkedIn|...&sort=appliedDate|company|lastUpdated&order=asc|desc
Returns: Application[]

POST   /api/seasons/{seasonId}/applications
Body:    { company, role, jobPostingUrl?, source, appliedDate, referrerName?, notes? }
Returns: Application
Side effects: log DailyActivity, check milestones

GET    /api/applications/{id}
Returns: Application (with Stages included)

PUT    /api/applications/{id}
Body:    { company?, role?, jobPostingUrl?, source?, notes? }
Returns: Application

DELETE /api/applications/{id}
Returns: 204

PATCH  /api/applications/{id}/status
Body:    { status: string }
Returns: Application
Side effects: log DailyActivity, check milestones, update LastUpdated

POST   /api/applications/{id}/stages
Body:    { type: string, scheduledDate?: string }
Returns: ApplicationStage
Side effects: log DailyActivity, check milestones

PUT    /api/applications/{id}/stages/{stageId}
Body:    { status?: string, completedDate?: string, notes?: string }
Returns: ApplicationStage
Side effects: log DailyActivity, check milestones
```

### Dashboard

```
GET /api/seasons/{id}/dashboard
Returns: {
  season: Season,
  stats: {
    totalApplications: number,
    responseRate: number,         // % of applications with any progress beyond Applied
    totalInterviews: number,      // total stage entries
    currentStreak: number,
    longestStreak: number,
    weeklyProgress: number,       // applications logged this calendar week
    weeklyTarget: number,
    personalBests: {
      bestWeekApplications: number,
      longestStreak: number
    }
  },
  funnel: Array<{
    stage: string,
    count: number,
    conversionRate: number | null  // null for first stage
  }>,
  topInsight: Insight | null,
  heatmap: Array<{ date: string, active: boolean }>,  // all days since season start
  milestones: Array<{
    milestone: Milestone,
    unlockedAt: string | null
  }>
}

GET /api/seasons/{id}/insights
Returns: Insight[]
// Insight: { type: string, message: string, priority: number }
```

### Admin (RBAC — Admin role only)

```
GET /api/admin/stats
Returns: { totalUsers, totalSeasons, totalApplications, avgApplicationsPerSeason }
```

---

## Business Logic

### Streak Calculation

```csharp
// DashboardService.cs
public int CalculateCurrentStreak(Guid userId)
{
    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var activities = _db.DailyActivities
        .Where(a => a.UserId == userId)
        .OrderByDescending(a => a.Date)
        .ToList();

    if (!activities.Any()) return 0;

    // Allow one day grace — streak is alive if logged today or yesterday
    if (activities.First().Date < today.AddDays(-1)) return 0;

    int streak = 0;
    var expected = today;
    foreach (var activity in activities)
    {
        if (activity.Date >= expected.AddDays(-1) && activity.Date <= expected)
        {
            streak++;
            expected = activity.Date.AddDays(-1);
        }
        else break;
    }
    return streak;
}

public int CalculateLongestStreak(Guid userId)
{
    var activities = _db.DailyActivities
        .Where(a => a.UserId == userId)
        .OrderBy(a => a.Date)
        .Select(a => a.Date)
        .ToList();

    if (!activities.Any()) return 0;

    int longest = 1, current = 1;
    for (int i = 1; i < activities.Count; i++)
    {
        if (activities[i] == activities[i - 1].AddDays(1))
            current++;
        else
            current = 1;
        longest = Math.Max(longest, current);
    }
    return longest;
}
```

### Daily Activity Logging

Called on every user-initiated write action (new application, status change, stage update):

```csharp
// ApplicationService.cs helper
private async Task LogActivity(Guid userId)
{
    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var exists = await _db.DailyActivities
        .AnyAsync(a => a.UserId == userId && a.Date == today);
    if (!exists)
    {
        _db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today });
        // SaveChanges is called by the calling method
    }
}
```

### Conversion Funnel Calculation

```csharp
// DashboardService.cs
public List<FunnelStageDto> CalculateFunnel(List<Application> applications)
{
    int total = applications.Count;
    int responded = applications.Count(a =>
        a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn);
    int interviewed = applications.Count(a =>
        a.Stages.Any() || (int)a.Status >= (int)ApplicationStatus.Screening);
    int final = applications.Count(a =>
        a.Status == ApplicationStatus.Final || a.Status == ApplicationStatus.Offer);
    int offer = applications.Count(a => a.Status == ApplicationStatus.Offer);

    return
    [
        new("Applied",     total,      null),
        new("Responded",   responded,  total > 0 ? (double)responded / total : null),
        new("Interview",   interviewed, responded > 0 ? (double)interviewed / responded : null),
        new("Final round", final,       interviewed > 0 ? (double)final / interviewed : null),
        new("Offer",       offer,       final > 0 ? (double)offer / final : null),
    ];
}
```

### Insight Rules

`InsightService` evaluates a set of rules and returns them ordered by priority. Dashboard returns only `topInsight` (priority 1). The insights endpoint returns all that apply.

```csharp
public record Insight(string Type, string Message, int Priority);

public List<Insight> GetInsights(Guid userId, Guid seasonId)
{
    var apps = _db.Applications
        .Include(a => a.Stages)
        .Where(a => a.SeasonId == seasonId)
        .ToList();
    var today = DateTime.UtcNow;
    var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);
    var insights = new List<Insight>();

    // 1. Streak at risk — streak > 3 and no activity today
    var streak = _dashboardService.CalculateCurrentStreak(userId);
    var activeToday = _db.DailyActivities.Any(a => a.UserId == userId && a.Date == DateOnly.FromDateTime(today));
    if (streak > 3 && !activeToday)
        insights.Add(new("streak-at-risk",
            $"You're on a {streak}-day streak. You haven't logged anything today — keep it going.",
            1));

    // 2. Source performance gap (min 3 apps per source compared)
    var bySource = apps
        .GroupBy(a => a.Source)
        .Where(g => g.Count() >= 3)
        .Select(g => new {
            Source = g.Key.ToString(),
            Rate = g.Count(a => a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn) / (double)g.Count()
        })
        .OrderByDescending(s => s.Rate)
        .ToList();
    if (bySource.Count >= 2 && bySource[0].Rate >= bySource[^1].Rate * 2)
        insights.Add(new("source-performance",
            $"{bySource[0].Source} applications are converting at {bySource[0].Rate:P0} vs {bySource[^1].Source} at {bySource[^1].Rate:P0}. Focus where it's working.",
            2));

    // 3. Stage drop-off (any stage with <30% conversion and >= 3 apps at that stage)
    // Identify the stage most commonly associated with rejection
    var technicalRejections = apps.Count(a => a.Status == ApplicationStatus.Rejected &&
        a.Stages.Any(s => s.Type == StageType.Technical && s.Status == StageStatus.Failed));
    if (technicalRejections >= 2)
        insights.Add(new("stage-dropoff",
            $"You've dropped off at the technical interview stage {technicalRejections} times this season. Consider focusing your prep there.",
            3));

    // 4. Response rate trending up (this week vs last week, min 3 apps each)
    var thisWeekApps = apps.Where(a => a.AppliedDate >= thisWeekStart).ToList();
    var lastWeekApps = apps.Where(a => a.AppliedDate >= thisWeekStart.AddDays(-7) && a.AppliedDate < thisWeekStart).ToList();
    if (thisWeekApps.Count >= 2 && lastWeekApps.Count >= 2)
    {
        var thisRate = thisWeekApps.Count(a => a.Status != ApplicationStatus.Applied) / (double)thisWeekApps.Count;
        var lastRate = lastWeekApps.Count(a => a.Status != ApplicationStatus.Applied) / (double)lastWeekApps.Count;
        if (thisRate >= lastRate + 0.10)
            insights.Add(new("response-rate-up",
                $"Your response rate this week ({thisRate:P0}) is up from last week ({lastRate:P0}). Something's working.",
                4));
    }

    // 5. Applications overdue for follow-up (>14 days, no response, not rejected/withdrawn)
    var stale = apps.Count(a =>
        a.Status == ApplicationStatus.Applied &&
        (today - a.AppliedDate).TotalDays > 14);
    if (stale > 0)
        insights.Add(new("follow-up-needed",
            $"{stale} application{(stale > 1 ? "s are" : " is")} past 14 days with no response. Worth chasing up.",
            5));

    // 6. Weekly target progress
    var season = _db.Seasons.Find(seasonId)!;
    var thisWeekCount = apps.Count(a => a.AppliedDate >= thisWeekStart);
    var dayOfWeek = (int)today.DayOfWeek;
    if (dayOfWeek is 3 or 4) // Wednesday or Thursday — mid-week check
    {
        if (thisWeekCount < season.WeeklyTarget * 0.3)
            insights.Add(new("weekly-behind",
                $"Only {thisWeekCount}/{season.WeeklyTarget} applications this week. You've still got time to catch up.",
                6));
        else if (thisWeekCount >= season.WeeklyTarget)
            insights.Add(new("weekly-target-hit",
                $"You've hit your weekly target of {season.WeeklyTarget}. Nice work.",
                6));
    }

    return insights.OrderBy(i => i.Priority).ToList();
}
```

### Milestone Check

Call `CheckAndUnlockMilestones` after every write operation that could trigger one.

```csharp
// MilestoneService.cs
public async Task CheckAndUnlockMilestones(Guid userId, Guid seasonId)
{
    var allMilestones = await _db.Milestones.ToListAsync();
    var alreadyUnlocked = await _db.UserMilestones
        .Where(um => um.UserId == userId && um.SeasonId == seasonId)
        .Select(um => um.MilestoneId)
        .ToListAsync();

    var apps = await _db.Applications
        .Include(a => a.Stages)
        .Where(a => a.SeasonId == seasonId && a.UserId == userId)
        .ToListAsync();

    var season = await _db.Seasons.FindAsync(seasonId);
    var streak = _dashboardService.CalculateCurrentStreak(userId);
    var thisWeekStart = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
    var thisWeekCount = apps.Count(a => a.AppliedDate >= thisWeekStart);

    var newUnlocks = new List<UserMilestone>();

    foreach (var milestone in allMilestones.Where(m => !alreadyUnlocked.Contains(m.Id)))
    {
        bool earned = milestone.Slug switch
        {
            "first-application"       => apps.Count >= 1,
            "ten-applications"        => apps.Count >= 10,
            "twenty-five-applications"=> apps.Count >= 25,
            "first-response"          => apps.Any(a => a.Status != ApplicationStatus.Applied
                                             && a.Status != ApplicationStatus.Withdrawn),
            "first-interview"         => apps.Any(a => a.Stages.Any()),
            "five-interviews"         => apps.SelectMany(a => a.Stages)
                                             .Count(s => s.Status == StageStatus.Completed) >= 5,
            "first-offer"             => apps.Any(a => a.Status == ApplicationStatus.Offer),
            "streak-7"                => streak >= 7,
            "streak-14"               => streak >= 14,
            "streak-30"               => streak >= 30,
            "weekly-target"           => season != null && thisWeekCount >= season.WeeklyTarget,
            _                         => false
        };

        if (earned)
        {
            newUnlocks.Add(new UserMilestone
            {
                UserId = userId,
                MilestoneId = milestone.Id,
                SeasonId = seasonId,
                UnlockedAt = DateTime.UtcNow
            });
        }
    }

    if (newUnlocks.Any())
    {
        _db.UserMilestones.AddRange(newUnlocks);
        await _db.SaveChangesAsync();
    }
}
```

### Season Close

```csharp
// SeasonService.cs
public async Task<Season> CloseSeasonAsync(Guid seasonId, Guid userId, string? outcome)
{
    var season = await _db.Seasons
        .Include(s => s.Applications).ThenInclude(a => a.Stages)
        .FirstOrDefaultAsync(s => s.Id == seasonId && s.UserId == userId)
        ?? throw new NotFoundException("Season not found");

    if (season.Status == SeasonStatus.Archived)
        throw new BadRequestException("Season is already archived");

    var apps = season.Applications.ToList();
    int responded = apps.Count(a => a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn);

    season.Status = SeasonStatus.Archived;
    season.EndDate = DateTime.UtcNow;
    season.Outcome = outcome;
    season.FinalApplicationCount = apps.Count;
    season.FinalResponseRate = apps.Count > 0 ? (double)responded / apps.Count : 0;
    season.FinalInterviewCount = apps.SelectMany(a => a.Stages).Count();
    season.FinalOfferCount = apps.Count(a => a.Status == ApplicationStatus.Offer);
    season.FinalStreakDays = _dashboardService.CalculateLongestStreak(userId);

    await _db.SaveChangesAsync();
    return season;
}
```

---

## Program.cs Setup

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build(); // All routes require auth by default
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 5;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});

// Services (register all)
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<SeasonService>();
builder.Services.AddScoped<ApplicationService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<InsightService>();
builder.Services.AddScoped<MilestoneService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
            "http://localhost:5173",               // Vite dev
            builder.Configuration["Frontend:Url"] ?? "" // Production
        )
        .AllowAnyMethod()
        .AllowAnyHeader());
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapOpenApi();
app.MapScalarApiReference(opts => opts.Title = "Roster API");

// Apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
```

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=roster.db"
  },
  "Jwt": {
    "Key": "CHANGE_THIS_TO_A_32_CHAR_SECRET_KEY",
    "Issuer": "roster-api",
    "Audience": "roster-client",
    "ExpiryMinutes": 1440
  },
  "Frontend": {
    "Url": "https://your-vercel-app.vercel.app"
  }
}
```

---

## Security Implementation

### BCrypt
```csharp
// Register
var hash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

// Verify
bool valid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
```

### Rate Limiting on Auth Routes
```csharp
[AllowAnonymous]
[EnableRateLimiting("auth")]
[HttpPost("login")]
public async Task<IActionResult> Login(LoginRequest request) { ... }

[AllowAnonymous]
[EnableRateLimiting("auth")]
[HttpPost("register")]
public async Task<IActionResult> Register(RegisterRequest request) { ... }
```

### RBAC Example
```csharp
[Authorize(Policy = "AdminOnly")]
[HttpGet("api/admin/stats")]
public async Task<IActionResult> GetStats() { ... }
```

---

## Scalar Setup

```xml
<!-- Roster.API.csproj -->
<PackageReference Include="Scalar.AspNetCore" Version="1.*" />
```

Scalar UI will be available at `/scalar/v1` in development. In production, keep it accessible for MSA marking.

---

## Frontend Key Patterns

### TypeScript Types

```ts
// src/types/index.ts
export interface User {
  id: string
  email: string
  username: string
  role: 'User' | 'Admin'
}

export interface Season {
  id: string
  name: string
  goal?: string
  weeklyTarget: number
  status: 'Active' | 'Archived'
  startDate: string
  endDate?: string
  outcome?: string
  finalApplicationCount?: number
  finalResponseRate?: number
  finalInterviewCount?: number
  finalOfferCount?: number
  finalStreakDays?: number
}

export interface Application {
  id: string
  seasonId: string
  company: string
  role: string
  jobPostingUrl?: string
  source: 'LinkedIn' | 'Seek' | 'Referral' | 'CompanyWebsite' | 'Other'
  status: ApplicationStatus
  appliedDate: string
  lastUpdated: string
  referrerName?: string
  notes?: string
  stages: ApplicationStage[]
}

export type ApplicationStatus =
  'Applied' | 'OA' | 'Screening' | 'Technical' | 'Final' | 'Offer' | 'Rejected' | 'Withdrawn'

export interface ApplicationStage {
  id: string
  applicationId: string
  type: 'OA' | 'PhoneScreen' | 'Technical' | 'Behavioural' | 'Final'
  status: 'Upcoming' | 'Completed' | 'Failed'
  scheduledDate?: string
  completedDate?: string
  notes?: string
}

export interface Milestone {
  id: string
  slug: string
  name: string
  description: string
}

export interface MilestoneStatus {
  milestone: Milestone
  unlockedAt: string | null
}

export interface Insight {
  type: string
  message: string
  priority: number
}

export interface FunnelStage {
  stage: string
  count: number
  conversionRate: number | null
}

export interface DashboardData {
  season: Season
  stats: {
    totalApplications: number
    responseRate: number
    totalInterviews: number
    currentStreak: number
    longestStreak: number
    weeklyProgress: number
    weeklyTarget: number
    personalBests: {
      bestWeekApplications: number
      longestStreak: number
    }
  }
  funnel: FunnelStage[]
  topInsight: Insight | null
  heatmap: Array<{ date: string; active: boolean }>
  milestones: MilestoneStatus[]
}
```

### Axios Client

```ts
// src/api/client.ts
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
```

### Zustand Stores

```ts
// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
)

// src/store/seasonStore.ts
import { create } from 'zustand'
import { DashboardData, Season } from '../types'
import { getDashboard } from '../api/dashboard'

interface SeasonState {
  activeSeason: Season | null
  dashboard: DashboardData | null
  dashboardLoading: boolean
  setActiveSeason: (season: Season) => void
  loadDashboard: (seasonId: string) => Promise<void>
  invalidateDashboard: () => void
}

export const useSeasonStore = create<SeasonState>((set) => ({
  activeSeason: null,
  dashboard: null,
  dashboardLoading: false,
  setActiveSeason: (season) => set({ activeSeason: season }),
  loadDashboard: async (seasonId) => {
    set({ dashboardLoading: true })
    const data = await getDashboard(seasonId)
    set({ dashboard: data, dashboardLoading: false })
  },
  invalidateDashboard: () => set({ dashboard: null }),
}))
```

### React Router Setup

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/board" element={<ProtectedRoute><ApplicationBoardPage /></ProtectedRoute>} />
        <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />
        <Route path="/seasons" element={<ProtectedRoute><SeasonHistoryPage /></ProtectedRoute>} />
        <Route path="/seasons/new" element={<ProtectedRoute><NewSeasonPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Dark Mode

```ts
// tailwind.config.ts
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

```tsx
// src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button onClick={() => setDark(d => !d)} aria-label="Toggle theme">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

### Key Component Notes

**ActivityHeatmap** — CSS Grid with `grid-template-columns: repeat(N, 14px)` and `grid-auto-flow: column`, where N = weeks since season start. One cell per day from the heatmap API response. Active days get a colored bg, inactive get a muted border. Show day-of-week labels (M W F) on the left.

**ConversionFunnel** — horizontal bars, no Recharts needed. Each row is a flex container: stage name (fixed width) + bar (flex-1, inner div width = `count/maxCount * 100%`) + count + conversion %. Use Tailwind for the bar fill color.

**InsightCallout** — dismissible info banner. Store dismissed insight types in localStorage and re-show on next dashboard load (insights are dynamic, not permanent dismissals).

**StageTimeline** — vertical ordered list of `ApplicationStage` entries. Each has a status indicator dot (upcoming = outline, completed = filled green, failed = filled red), type label, date, and optional notes. Include an "Add stage" button at the bottom of the list.

---

## Docker

```dockerfile
# Dockerfile.backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY backend/ .
RUN dotnet restore Roster.sln
RUN dotnet publish Roster.API/Roster.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .
VOLUME /app/data
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "Roster.API.dll"]
```

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json .
RUN npm ci
COPY frontend/ .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports: ["5000:5000"]
    volumes: [sqlite-data:/app/data]
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/roster.db
      - Jwt__Key=${JWT_KEY}
      - Jwt__Issuer=roster-api
      - Jwt__Audience=roster-client
      - Frontend__Url=http://localhost:3000

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        VITE_API_URL: http://localhost:5000
    ports: ["3000:80"]
    depends_on: [backend]

volumes:
  sqlite-data:
```

---

## Build Order

### Phase 1 — Backend foundation
1. `dotnet new sln -n Roster` → add API and Tests projects
2. Add all NuGet packages (EF Core + SQLite, BCrypt, JWT, Scalar, Rate Limiting)
3. Define all entities → create `AppDbContext` with milestone seeds
4. `dotnet ef migrations add InitialCreate` → `dotnet ef database update`
5. Implement `AuthService` (register, login, JWT generation with claims)
6. `AuthController` with `[AllowAnonymous]` and `[EnableRateLimiting("auth")]`
7. `SeasonService` + `SeasonsController` (CRUD + close)
8. `ApplicationService` + `ApplicationsController` (CRUD + PATCH status + stages)
   - LogActivity called on every write
   - CheckAndUnlockMilestones called after every write
9. `DashboardService` (streak, longest streak, funnel, heatmap, personal bests)
10. `InsightService` (all insight rules)
11. `MilestoneService` (check and unlock)
12. `DashboardController` (single endpoint assembling all above)
13. `AdminController` with `[Authorize(Policy = "AdminOnly")]`
14. `ExceptionMiddleware` (global error handling → consistent error response shape)
15. xUnit tests: `AuthServiceTests`, `ApplicationServiceTests`, `InsightServiceTests`, `MilestoneServiceTests`
16. Configure `Program.cs` in full (CORS, rate limiting, fallback auth policy, Scalar, migration on startup)

### Phase 2 — Frontend foundation
17. `npm create vite@latest frontend -- --template react-ts`
18. Install: `tailwindcss postcss autoprefixer react-router-dom zustand axios recharts lucide-react`
19. Configure Tailwind (darkMode: 'class')
20. Create `src/types/index.ts` with all interfaces
21. Create `src/api/client.ts` (Axios instance + interceptors)
22. Create all API method files (`auth.ts`, `seasons.ts`, `applications.ts`, `dashboard.ts`)
23. Create Zustand stores (`authStore`, `seasonStore`, `applicationStore`)
24. `LoginPage` + `RegisterPage` + `ProtectedRoute`
25. `App.tsx` with full router setup
26. `NavBar.tsx` + `ThemeToggle.tsx`
27. `ApplicationBoardPage` (list with status/source filters)
28. `ApplicationDetailPage` (with `StageTimeline`)
29. `DashboardPage` (all components: stats, funnel, heatmap, insight, milestones)
30. `SeasonHistoryPage` + `NewSeasonPage`

### Phase 3 — Polish and advanced features
31. Responsive layout on all pages (mobile nav drawer, responsive grids)
32. Dark mode on all components (Tailwind `dark:` variants)
33. `ActivityHeatmap`, `InsightCallout` (dismissible), `ConversionFunnel` as proper components
34. Milestone unlock animation (simple CSS transition when newly unlocked)
35. Vitest unit tests for `ConversionFunnel`, `ActivityHeatmap`, `InsightCallout`, auth store
36. Docker setup and `docker-compose.yml`

### Phase 4 — Submission prep
37. Deploy backend to Railway, frontend to Vercel
38. Write `/specs/ai-prompts.md` (document AI prompts used throughout — MSA requirement)
39. Write `/specs/project-plan.md`
40. Write `README.md` (deployment links, intro, theme section, advanced checklist, self-reflection)
41. Final commit history review — ensure commits are spread across weeks, not one dump
42. Record 6-minute video:
    - Part 1: Show AI usage (Claude Code sessions, prompts from specs folder)
    - Part 2: Design decisions (season framing rationale, insight system, why simple gamification over points/levels)

---

## Notes

- User ID always comes from `User.FindFirst(ClaimTypes.NameIdentifier)` — never trust a userId from the request body.
- All Season/Application queries must filter by `UserId` to prevent users accessing each other's data.
- The dashboard endpoint is the heaviest — it's fine for an MSA project, but consider adding `[ResponseCache(Duration = 30)]` if it feels slow.
- The `/specs` folder with `.md` AI prompt files is an MSA requirement. Create it early and add to it throughout development.
- Milestone seeds use hardcoded GUIDs so migrations are idempotent across environments — use `Guid.Parse("...")` with fixed values rather than `Guid.NewGuid()`.
