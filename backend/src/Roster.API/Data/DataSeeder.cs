using Microsoft.EntityFrameworkCore;
using Roster.API.Models;

namespace Roster.API.Data;

public static class DataSeeder
{
    public static readonly Guid DemoUserId = Guid.Parse("22222222-2222-2222-2222-222222222001");
    private static readonly Guid SeasonId = Guid.Parse("22222222-2222-2222-2222-222222222002");
    public const string DemoEmail = "demo@roster.dev";
    public const string DemoPassword = "demo1234";

    public static async Task SeedDemoUserAsync(AppDbContext db)
    {
        var existing = await db.Users.FindAsync(DemoUserId);
        if (existing is not null)
        {
            db.UserMilestones.RemoveRange(db.UserMilestones.Where(m => m.UserId == DemoUserId));
            db.DailyActivities.RemoveRange(db.DailyActivities.Where(d => d.UserId == DemoUserId));
            db.ApplicationStages.RemoveRange(db.ApplicationStages.Where(s => s.Application.UserId == DemoUserId));
            db.Applications.RemoveRange(db.Applications.Where(a => a.UserId == DemoUserId));
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
            Role = "User",
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

        var statuses = new[]
        {
            ApplicationStatus.Applied, ApplicationStatus.Applied, ApplicationStatus.Applied,
            ApplicationStatus.Screening, ApplicationStatus.Screening,
            ApplicationStatus.OA, ApplicationStatus.OA,
            ApplicationStatus.Technical, ApplicationStatus.Technical,
            ApplicationStatus.Final,
            ApplicationStatus.Offer,
            ApplicationStatus.Rejected, ApplicationStatus.Rejected, ApplicationStatus.Rejected,
            ApplicationStatus.Withdrawn
        };
        var sources = Enum.GetValues<ApplicationSource>();

        var applications = new List<Application>();
        var stages = new List<ApplicationStage>();

        for (var i = 0; i < companies.Length; i++)
        {
            var (company, role) = companies[i];
            var status = statuses[i % statuses.Length];
            var appliedDaysAgo = rng.Next(1, 44);
            var appliedDate = DateTime.UtcNow.AddDays(-appliedDaysAgo);

            var application = new Application
            {
                Id = Guid.NewGuid(),
                SeasonId = SeasonId,
                UserId = DemoUserId,
                Company = company,
                Role = role,
                Source = sources[rng.Next(sources.Length)],
                Status = status,
                AppliedDate = appliedDate,
                LastUpdated = appliedDate.AddDays(rng.Next(0, Math.Max(1, appliedDaysAgo))),
                ReferrerName = rng.Next(0, 4) == 0 ? "Alex Chen" : null,
                Notes = status == ApplicationStatus.Offer ? "Verbal offer received, awaiting written contract" : null
            };
            applications.Add(application);

            stages.AddRange(BuildStages(application, status, appliedDate, rng));
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
        Application application, ApplicationStatus status, DateTime appliedDate, Random rng)
    {
        var progression = new[]
        {
            StageType.OA, StageType.PhoneScreen, StageType.Technical,
            StageType.Behavioural, StageType.Final
        };

        var reachedCount = status switch
        {
            ApplicationStatus.Applied => 0,
            ApplicationStatus.OA => 1,
            ApplicationStatus.Screening => 2,
            ApplicationStatus.Technical => 3,
            ApplicationStatus.Final => 5,
            ApplicationStatus.Offer => 5,
            ApplicationStatus.Rejected => rng.Next(1, 4),
            ApplicationStatus.Withdrawn => rng.Next(0, 3),
            _ => 0
        };

        var cursor = appliedDate;
        for (var i = 0; i < reachedCount; i++)
        {
            cursor = cursor.AddDays(rng.Next(1, 6));
            var isLast = i == reachedCount - 1;
            var failedHere = isLast && status == ApplicationStatus.Rejected;

            yield return new ApplicationStage
            {
                Id = Guid.NewGuid(),
                ApplicationId = application.Id,
                Type = progression[i],
                Status = failedHere ? StageStatus.Failed : StageStatus.Completed,
                ScheduledDate = cursor,
                CompletedDate = failedHere ? null : cursor
            };
        }
    }
}
