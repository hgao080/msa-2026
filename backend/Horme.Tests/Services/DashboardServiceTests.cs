using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.Exceptions;
using Horme.API.Models;
using Horme.API.Services;

namespace Horme.Tests.Services;

public class DashboardServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }

    private static Season SeedSeason(AppDbContext db, Guid userId, DateTime? startDate = null)
    {
        var season = new Season
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Season",
            WeeklyTarget = 5,
            StartDate = startDate ?? DateTime.UtcNow.AddDays(-10)
        };
        db.Seasons.Add(season);
        return season;
    }

    [Fact]
    public async Task GetDashboardAsync_OtherUsersSeason_ThrowsNotFound()
    {
        using var db = CreateDb();
        var season = SeedSeason(db, Guid.NewGuid());
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new DashboardService(db).GetDashboardAsync(season.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task GetDashboardAsync_NoActivity_ReturnsZeroedStatsAndFullHeatmapRange()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId, DateTime.UtcNow.AddDays(-3));
        await db.SaveChangesAsync();

        var dashboard = await new DashboardService(db).GetDashboardAsync(season.Id, userId);

        Assert.Equal(0, dashboard.Stats.TotalApplications);
        Assert.Equal(0, dashboard.Stats.CurrentStreak);
        Assert.Equal(4, dashboard.Heatmap.Count);
        Assert.All(dashboard.Heatmap, d => Assert.False(d.Active));
    }

    [Fact]
    public async Task GetDashboardAsync_WithApplicationsAndActivity_AggregatesStatsAndFunnel()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        db.Applications.Add(new Application
        {
            Id = Guid.NewGuid(),
            SeasonId = season.Id,
            Company = "Acme",
            Role = "Engineer",
            Status = ApplicationStatus.Offer,
            AppliedDate = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow
        });
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today });
        await db.SaveChangesAsync();

        var dashboard = await new DashboardService(db).GetDashboardAsync(season.Id, userId);

        Assert.Equal(1, dashboard.Stats.TotalApplications);
        Assert.Equal(1, dashboard.Stats.CurrentStreak);
        Assert.Equal(4, dashboard.Funnel.Count);
        Assert.Equal(1, dashboard.Funnel.Single(f => f.Stage == "Offer").Count);
        Assert.True(dashboard.Heatmap.First(d => d.Date == today.ToString("yyyy-MM-dd")).Active);
    }

    [Fact]
    public async Task GetDashboardAsync_ReportsMilestoneUnlockState()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        db.UserMilestones.Add(new UserMilestone
        {
            UserId = userId,
            SeasonId = season.Id,
            MilestoneId = Guid.Parse("11111111-1111-1111-1111-111111111001"),
            UnlockedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var dashboard = await new DashboardService(db).GetDashboardAsync(season.Id, userId);

        var unlocked = dashboard.Milestones.Single(m => m.Milestone.Slug == "first-application");
        var locked = dashboard.Milestones.Single(m => m.Milestone.Slug == "ten-applications");
        Assert.NotNull(unlocked.UnlockedAt);
        Assert.Null(locked.UnlockedAt);
    }
}
