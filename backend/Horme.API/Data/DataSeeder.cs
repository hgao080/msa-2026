using Microsoft.EntityFrameworkCore;
using Horme.API.Helpers;
using Horme.API.Models;

namespace Horme.API.Data;

public static class DataSeeder
{
    public static readonly Guid DemoUserId = Guid.Parse("22222222-2222-2222-2222-222222222001");
    private static readonly Guid SeasonId = Guid.Parse("22222222-2222-2222-2222-222222222002");
    public const string DemoEmail = "demo@horme.dev";
    public const string DemoPassword = "demo1234";

    public static async Task SeedDemoUserAsync(AppDbContext db)
    {
        var existing = await db.Users.FindAsync(DemoUserId);
        if (existing is not null)
        {
            db.UserMilestones.RemoveRange(db.UserMilestones.Where(m => m.UserId == DemoUserId));
            db.DailyActivities.RemoveRange(db.DailyActivities.Where(d => d.UserId == DemoUserId));
            db.ApplicationStages.RemoveRange(db.ApplicationStages.Where(s => s.Application.Season.UserId == DemoUserId));
            db.Applications.RemoveRange(db.Applications.Where(a => a.Season.UserId == DemoUserId));
            db.Seasons.RemoveRange(db.Seasons.Where(s => s.UserId == DemoUserId));
            db.Users.Remove(existing);
            await db.SaveChangesAsync();
        }

        var user = new User
        {
            Id = DemoUserId,
            Email = DemoEmail,
            Username = "demo",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoPassword, workFactor: 12),
            CreatedAt = DateTime.UtcNow.AddDays(-45)
        };
        db.Users.Add(user);

        var season = new Season
        {
            Id = SeasonId,
            UserId = DemoUserId,
            Name = "2026 Grad Search",
            Goal = "Land a software engineering grad role",
            WeeklyTarget = 5,
            Status = SeasonStatus.Active,
            StartDate = DateTime.UtcNow.AddDays(-45)
        };
        db.Seasons.Add(season);

        var rng = new Random(42);
        var companies = new (string Company, string Role)[]
        {
            ("Atlassian", "Graduate Software Engineer"),
            ("Canva", "Software Engineer I"),
            ("Xero", "Graduate Developer"),
            ("REA Group", "Junior Software Engineer"),
            ("SEEK", "Graduate Engineer"),
            ("Afterpay", "Software Engineer"),
            ("Culture Amp", "Graduate Software Engineer"),
            ("NAB", "Technology Graduate"),
            ("Commonwealth Bank", "Graduate Software Engineer"),
            ("Telstra", "Software Engineer Graduate"),
            ("Envato", "Junior Developer"),
            ("Deputy", "Graduate Software Engineer"),
            ("Linktree", "Software Engineer"),
            ("Canva", "Backend Engineer Intern"),
            ("Zip Co", "Graduate Software Engineer"),
            ("Domain Group", "Junior Software Engineer"),
            ("MYOB", "Graduate Developer"),
            ("Airwallex", "Software Engineer Graduate"),
            ("Safety Culture", "Graduate Software Engineer"),
            ("Employment Hero", "Junior Engineer")
        };

        // (stages reached, fail the last one, mark offered, mark withdrawn)
        var plans = new[]
        {
            (Stages: 0, Fail: false, Offer: false, Withdraw: false),
            (Stages: 0, Fail: false, Offer: false, Withdraw: false),
            (Stages: 0, Fail: false, Offer: false, Withdraw: false),
            (Stages: 2, Fail: false, Offer: false, Withdraw: false),
            (Stages: 2, Fail: false, Offer: false, Withdraw: false),
            (Stages: 1, Fail: false, Offer: false, Withdraw: false),
            (Stages: 1, Fail: false, Offer: false, Withdraw: false),
            (Stages: 3, Fail: false, Offer: false, Withdraw: false),
            (Stages: 3, Fail: false, Offer: false, Withdraw: false),
            (Stages: 4, Fail: false, Offer: false, Withdraw: false),
            (Stages: 4, Fail: false, Offer: true, Withdraw: false),
            (Stages: rng.Next(1, 4), Fail: true, Offer: false, Withdraw: false),
            (Stages: rng.Next(1, 4), Fail: true, Offer: false, Withdraw: false),
            (Stages: rng.Next(1, 4), Fail: true, Offer: false, Withdraw: false),
            (Stages: rng.Next(0, 3), Fail: false, Offer: false, Withdraw: true)
        };
        var sources = Enum.GetValues<ApplicationSource>();

        var applications = new List<Application>();
        var stages = new List<ApplicationStage>();

        for (var i = 0; i < companies.Length; i++)
        {
            var (company, role) = companies[i];
            var plan = plans[i % plans.Length];
            var appliedDaysAgo = rng.Next(1, 44);
            var appliedDate = DateTime.UtcNow.AddDays(-appliedDaysAgo);

            var application = new Application
            {
                Id = Guid.NewGuid(),
                SeasonId = SeasonId,
                Company = company,
                Role = role,
                Source = sources[rng.Next(sources.Length)],
                AppliedDate = appliedDate,
                LastUpdated = appliedDate.AddDays(rng.Next(0, Math.Max(1, appliedDaysAgo))),
                ReferrerName = rng.Next(0, 4) == 0 ? "Alex Chen" : null,
                OfferedAt = plan.Offer ? appliedDate.AddDays(rng.Next(5, Math.Max(6, appliedDaysAgo))) : null,
                WithdrawnAt = plan.Withdraw ? appliedDate.AddDays(rng.Next(1, Math.Max(2, appliedDaysAgo))) : null,
                Notes = plan.Offer ? "Verbal offer received, awaiting written contract" : null
            };
            application.Stages = BuildStages(application, plan.Stages, plan.Fail, appliedDate, rng).ToList();
            application.Status = ApplicationStats.ComputeStatus(application);
            applications.Add(application);
            stages.AddRange(application.Stages);
        }

        db.Applications.AddRange(applications);
        db.ApplicationStages.AddRange(stages);

        var activityDays = new HashSet<DateOnly>();
        foreach (var app in applications)
            activityDays.Add(DateOnly.FromDateTime(app.AppliedDate));
        for (var d = 0; d < 9; d++)
            activityDays.Add(DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-d)));

        db.DailyActivities.AddRange(activityDays.Select(date => new DailyActivity
        {
            UserId = DemoUserId,
            Date = date
        }));

        var milestoneIds = new[]
        {
            "11111111-1111-1111-1111-111111111001",
            "11111111-1111-1111-1111-111111111002",
            "11111111-1111-1111-1111-111111111004",
            "11111111-1111-1111-1111-111111111005",
            "11111111-1111-1111-1111-111111111008"
        };
        db.UserMilestones.AddRange(milestoneIds.Select(id => new UserMilestone
        {
            UserId = DemoUserId,
            MilestoneId = Guid.Parse(id),
            SeasonId = SeasonId,
            UnlockedAt = DateTime.UtcNow.AddDays(-rng.Next(1, 30))
        }));

        await db.SaveChangesAsync();
    }

    private static IEnumerable<ApplicationStage> BuildStages(
        Application application, int reachedCount, bool failLast, DateTime appliedDate, Random rng)
    {
        var progression = new[]
        {
            StageType.Oa, StageType.PhoneScreen, StageType.Technical, StageType.Behavioural
        };
        reachedCount = Math.Min(reachedCount, progression.Length);

        var cursor = appliedDate;
        for (var i = 0; i < reachedCount; i++)
        {
            cursor = cursor.AddDays(rng.Next(1, 6));
            var isLast = i == reachedCount - 1;
            var failedHere = isLast && failLast;

            yield return new ApplicationStage
            {
                Id = Guid.NewGuid(),
                ApplicationId = application.Id,
                Type = progression[i],
                Status = failedHere ? StageStatus.Failed : StageStatus.Completed,
                CreatedAt = cursor,
                ScheduledDate = cursor,
                CompletedDate = failedHere ? null : cursor
            };
        }
    }
}
