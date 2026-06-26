using Roster.API.Helpers;
using Roster.API.Models;
using Roster.API.Services;

namespace Roster.Tests.Services;

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
            new() { Status = ApplicationStatus.Screening },
        };
        Assert.Equal(0.5, ApplicationStats.ResponseRate(apps));
    }
}
