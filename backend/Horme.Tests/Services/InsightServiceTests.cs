using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.Models;
using Horme.API.Services;

namespace Horme.Tests.Services;

public class InsightServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static Season SeedSeason(AppDbContext db, Guid userId)
    {
        var season = new Season { Id = Guid.NewGuid(), UserId = userId, Name = "Season", WeeklyTarget = 5, StartDate = DateTime.UtcNow.AddDays(-30) };
        db.Seasons.Add(season);
        return season;
    }

    private static Application NewApp(Guid userId, Guid seasonId, ApplicationStatus status, DateTime appliedDate, ApplicationSource source = ApplicationSource.LinkedIn) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        SeasonId = seasonId,
        Company = "Acme",
        Role = "Engineer",
        Status = status,
        Source = source,
        AppliedDate = appliedDate,
        LastUpdated = appliedDate
    };

    [Fact]
    public async Task GetInsightsAsync_NoData_ReturnsEmpty()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();

        // No season row so the day-of-week-gated weekly rules short-circuit before running.
        var insights = await new InsightService(db).GetInsightsAsync(userId, Guid.NewGuid());

        Assert.Empty(insights);
    }

    [Fact]
    public async Task GetInsightsAsync_StreakOverThreeWithNoActivityToday_FlagsStreakAtRisk()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        db.DailyActivities.AddRange(Enumerable.Range(1, 4).Select(d => new DailyActivity { UserId = userId, Date = today.AddDays(-d) }));
        await db.SaveChangesAsync();

        var insights = await new InsightService(db).GetInsightsAsync(userId, season.Id);

        Assert.Contains(insights, i => i.Type == "streak-at-risk");
    }

    [Fact]
    public async Task GetInsightsAsync_ActiveToday_DoesNotFlagStreakAtRisk()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        db.DailyActivities.AddRange(Enumerable.Range(0, 5).Select(d => new DailyActivity { UserId = userId, Date = today.AddDays(-d) }));
        await db.SaveChangesAsync();

        var insights = await new InsightService(db).GetInsightsAsync(userId, season.Id);

        Assert.DoesNotContain(insights, i => i.Type == "streak-at-risk");
    }

    [Fact]
    public async Task GetInsightsAsync_OneSourceConvertsMuchBetter_FlagsSourcePerformance()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        var now = DateTime.UtcNow;
        db.Applications.AddRange(
            NewApp(userId, season.Id, ApplicationStatus.Technical, now, ApplicationSource.Referral),
            NewApp(userId, season.Id, ApplicationStatus.PhoneScreen, now, ApplicationSource.Referral),
            NewApp(userId, season.Id, ApplicationStatus.Offer, now, ApplicationSource.Referral),
            NewApp(userId, season.Id, ApplicationStatus.Applied, now, ApplicationSource.Seek),
            NewApp(userId, season.Id, ApplicationStatus.Applied, now, ApplicationSource.Seek),
            NewApp(userId, season.Id, ApplicationStatus.Applied, now, ApplicationSource.Seek));
        await db.SaveChangesAsync();

        var insights = await new InsightService(db).GetInsightsAsync(userId, season.Id);

        Assert.Contains(insights, i => i.Type == "source-performance");
    }

    [Fact]
    public async Task GetInsightsAsync_TwoTechnicalRejections_FlagsStageDropoff()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        var now = DateTime.UtcNow;
        var app1 = NewApp(userId, season.Id, ApplicationStatus.Rejected, now);
        app1.Stages.Add(new ApplicationStage { Id = Guid.NewGuid(), ApplicationId = app1.Id, Type = StageType.Technical, Status = StageStatus.Failed });
        var app2 = NewApp(userId, season.Id, ApplicationStatus.Rejected, now);
        app2.Stages.Add(new ApplicationStage { Id = Guid.NewGuid(), ApplicationId = app2.Id, Type = StageType.Technical, Status = StageStatus.Failed });
        db.Applications.AddRange(app1, app2);
        await db.SaveChangesAsync();

        var insights = await new InsightService(db).GetInsightsAsync(userId, season.Id);

        Assert.Contains(insights, i => i.Type == "stage-dropoff");
    }

    [Fact]
    public async Task GetInsightsAsync_StaleApplicationsPast14Days_FlagsFollowUpNeeded()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        db.Applications.Add(NewApp(userId, season.Id, ApplicationStatus.Applied, DateTime.UtcNow.AddDays(-20)));
        await db.SaveChangesAsync();

        var insights = await new InsightService(db).GetInsightsAsync(userId, season.Id);

        Assert.Contains(insights, i => i.Type == "follow-up-needed");
    }

    [Fact]
    public async Task GetInsightsAsync_MultipleRulesFire_OrderedByPriority()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        db.DailyActivities.AddRange(Enumerable.Range(1, 4).Select(d => new DailyActivity { UserId = userId, Date = today.AddDays(-d) }));
        db.Applications.Add(NewApp(userId, season.Id, ApplicationStatus.Applied, DateTime.UtcNow.AddDays(-20)));
        await db.SaveChangesAsync();

        var insights = await new InsightService(db).GetInsightsAsync(userId, season.Id);

        Assert.Equal(insights.OrderBy(i => i.Priority).Select(i => i.Type), insights.Select(i => i.Type));
    }
}
