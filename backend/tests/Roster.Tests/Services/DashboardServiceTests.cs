using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.Models;
using Roster.API.Services;

namespace Roster.Tests.Services;

public class DashboardServiceTests
{
    private AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public void CalculateCurrentStreak_NoActivity_ReturnsZero()
    {
        using var db = CreateDb();
        var service = new DashboardService(db);
        Assert.Equal(0, service.CalculateCurrentStreak(Guid.NewGuid()));
    }

    [Fact]
    public void CalculateCurrentStreak_ActivityToday_ReturnsOne()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today });
        db.SaveChanges();

        var service = new DashboardService(db);
        Assert.Equal(1, service.CalculateCurrentStreak(userId));
    }

    [Fact]
    public void CalculateCurrentStreak_ConsecutiveDays_ReturnsCorrectCount()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        for (int i = 0; i < 5; i++)
            db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today.AddDays(-i) });
        db.SaveChanges();

        var service = new DashboardService(db);
        Assert.Equal(5, service.CalculateCurrentStreak(userId));
    }

    [Fact]
    public void CalculateLongestStreak_WithGap_ReturnsLongest()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        // 3 consecutive, then gap, then 2
        db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today.AddDays(-10) });
        db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today.AddDays(-9) });
        db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today.AddDays(-8) });
        db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today.AddDays(-3) });
        db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today.AddDays(-2) });
        db.SaveChanges();

        var service = new DashboardService(db);
        Assert.Equal(3, service.CalculateLongestStreak(userId));
    }

    [Fact]
    public void CalculateFunnel_NoApplications_ReturnsZeroCounts()
    {
        using var db = CreateDb();
        var service = new DashboardService(db);
        var funnel = service.CalculateFunnel([]);
        Assert.Equal(5, funnel.Count);
        Assert.All(funnel, f => Assert.Equal(0, f.Count));
    }
}
