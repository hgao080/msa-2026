using Horme.API.Helpers;
using Horme.API.Models;
using Horme.API.Services;

namespace Horme.Tests.Services;

public class ApplicationStatsTests
{
    private static List<DailyActivity> Activities(Guid userId, params int[] daysAgo)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return daysAgo.Select(d => new DailyActivity { UserId = userId, Date = today.AddDays(-d) }).ToList();
    }

    [Fact]
    public void CurrentStreak_NoActivity_ReturnsZero()
    {
        Assert.Equal(0, ApplicationStats.CurrentStreak([]));
    }

    [Fact]
    public void CurrentStreak_ActivityToday_ReturnsOne()
    {
        var activities = Activities(Guid.NewGuid(), 0);
        Assert.Equal(1, ApplicationStats.CurrentStreak(activities));
    }

    [Fact]
    public void CurrentStreak_FiveConsecutiveDays_ReturnsFive()
    {
        var activities = Activities(Guid.NewGuid(), 0, 1, 2, 3, 4);
        Assert.Equal(5, ApplicationStats.CurrentStreak(activities));
    }

    [Fact]
    public void CurrentStreak_GapBeforeToday_ReturnsZero()
    {
        var activities = Activities(Guid.NewGuid(), 3, 4, 5);
        Assert.Equal(0, ApplicationStats.CurrentStreak(activities));
    }

    [Fact]
    public void LongestStreak_WithGap_ReturnsLongestSegment()
    {
        var activities = Activities(Guid.NewGuid(), 10, 9, 8, 3, 2);
        Assert.Equal(3, ApplicationStats.LongestStreak(activities));
    }

    [Fact]
    public void LongestStreak_NoActivity_ReturnsZero()
    {
        Assert.Equal(0, ApplicationStats.LongestStreak([]));
    }

    [Fact]
    public void CalculateFunnel_NoApplications_ReturnsZeroCounts()
    {
        var funnel = DashboardService.CalculateFunnel([]);
        Assert.Equal(5, funnel.Count);
        Assert.All(funnel, f => Assert.Equal(0, f.Count));
    }

    [Fact]
    public void ResponseRate_NoApps_ReturnsZero()
    {
        Assert.Equal(0, ApplicationStats.ResponseRate([]));
    }

    [Fact]
    public void ResponseRate_AllApplied_ReturnsZero()
    {
        var apps = new List<Application>
        {
            new() { Status = ApplicationStatus.Applied },
            new() { Status = ApplicationStatus.Applied },
        };
        Assert.Equal(0, ApplicationStats.ResponseRate(apps));
    }

    [Fact]
    public void ResponseRate_HalfResponded_ReturnsHalf()
    {
        var apps = new List<Application>
        {
            new() { Status = ApplicationStatus.Applied },
            new() { Status = ApplicationStatus.PhoneScreen },
        };
        Assert.Equal(0.5, ApplicationStats.ResponseRate(apps));
    }

    private static Application AppWithStages(params ApplicationStage[] stages)
    {
        var app = new Application();
        foreach (var s in stages) app.Stages.Add(s);
        return app;
    }

    private static ApplicationStage Stage(StageType type, StageStatus status, int createdDaysAgo) => new()
    {
        Type = type,
        Status = status,
        CreatedAt = DateTime.UtcNow.AddDays(-createdDaysAgo)
    };

    [Fact]
    public void ComputeStatus_NoStages_ReturnsApplied()
    {
        var app = new Application();
        Assert.Equal(ApplicationStatus.Applied, ApplicationStats.ComputeStatus(app));
    }

    [Fact]
    public void ComputeStatus_UsesLatestStageByCreatedAt()
    {
        var app = AppWithStages(
            Stage(StageType.OA, StageStatus.Completed, createdDaysAgo: 5),
            Stage(StageType.Technical, StageStatus.Completed, createdDaysAgo: 1));

        Assert.Equal(ApplicationStatus.Technical, ApplicationStats.ComputeStatus(app));
    }

    [Fact]
    public void ComputeStatus_LatestStageFailed_ReturnsRejected()
    {
        var app = AppWithStages(
            Stage(StageType.OA, StageStatus.Completed, createdDaysAgo: 5),
            Stage(StageType.Technical, StageStatus.Failed, createdDaysAgo: 1));

        Assert.Equal(ApplicationStatus.Rejected, ApplicationStats.ComputeStatus(app));
    }

    [Fact]
    public void ComputeStatus_WithdrawnAtSet_ReturnsWithdrawn()
    {
        var app = AppWithStages(Stage(StageType.OA, StageStatus.Completed, createdDaysAgo: 1));
        app.WithdrawnAt = DateTime.UtcNow;

        Assert.Equal(ApplicationStatus.Withdrawn, ApplicationStats.ComputeStatus(app));
    }

    [Fact]
    public void ComputeStatus_OfferAndWithdrawnBothSet_OfferTakesPrecedence()
    {
        var app = new Application { OfferedAt = DateTime.UtcNow, WithdrawnAt = DateTime.UtcNow };
        Assert.Equal(ApplicationStatus.Offer, ApplicationStats.ComputeStatus(app));
    }
}
