using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.Models;
using Horme.API.Services;

namespace Horme.Tests.Services;

public class MilestoneServiceTests
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

    private static Season SeedSeason(AppDbContext db, Guid userId, int weeklyTarget = 5)
    {
        var season = new Season { Id = Guid.NewGuid(), UserId = userId, Name = "Season", WeeklyTarget = weeklyTarget, StartDate = DateTime.UtcNow };
        db.Seasons.Add(season);
        return season;
    }

    private static Application NewApp(Guid userId, Guid seasonId, ApplicationStatus status = ApplicationStatus.Applied, DateTime? appliedDate = null) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        SeasonId = seasonId,
        Company = "Acme",
        Role = "Engineer",
        Status = status,
        AppliedDate = appliedDate ?? DateTime.UtcNow,
        LastUpdated = DateTime.UtcNow
    };

    private static async Task<List<string>> UnlockedSlugs(AppDbContext db, Guid userId, Guid seasonId) =>
        await db.UserMilestones
            .Where(um => um.UserId == userId && um.SeasonId == seasonId)
            .Join(db.Milestones, um => um.MilestoneId, m => m.Id, (um, m) => m.Slug)
            .ToListAsync();

    [Fact]
    public async Task CheckAndUnlockMilestones_FirstApplication_UnlocksFirstApplicationOnly()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        db.Applications.Add(NewApp(userId, season.Id));
        await db.SaveChangesAsync();

        await new MilestoneService(db).CheckAndUnlockMilestones(userId, season.Id);

        var slugs = await UnlockedSlugs(db, userId, season.Id);
        Assert.Contains("first-application", slugs);
        Assert.DoesNotContain("ten-applications", slugs);
    }

    [Fact]
    public async Task CheckAndUnlockMilestones_TenApplications_UnlocksTenApplicationsMilestone()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        db.Applications.AddRange(Enumerable.Range(0, 10).Select(_ => NewApp(userId, season.Id)));
        await db.SaveChangesAsync();

        await new MilestoneService(db).CheckAndUnlockMilestones(userId, season.Id);

        var slugs = await UnlockedSlugs(db, userId, season.Id);
        Assert.Contains("ten-applications", slugs);
    }

    [Fact]
    public async Task CheckAndUnlockMilestones_AlreadyUnlocked_DoesNotDuplicate()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        db.Applications.Add(NewApp(userId, season.Id));
        await db.SaveChangesAsync();
        var service = new MilestoneService(db);

        await service.CheckAndUnlockMilestones(userId, season.Id);
        await service.CheckAndUnlockMilestones(userId, season.Id);

        var count = await db.UserMilestones
            .CountAsync(um => um.UserId == userId && um.SeasonId == season.Id && um.MilestoneId == Guid.Parse("11111111-1111-1111-1111-111111111001"));
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task CheckAndUnlockMilestones_FirstOffer_UnlocksFirstOfferMilestone()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        db.Applications.Add(NewApp(userId, season.Id, ApplicationStatus.Offer));
        await db.SaveChangesAsync();

        await new MilestoneService(db).CheckAndUnlockMilestones(userId, season.Id);

        var slugs = await UnlockedSlugs(db, userId, season.Id);
        Assert.Contains("first-offer", slugs);
    }

    [Fact]
    public async Task CheckAndUnlockMilestones_SevenDayStreak_UnlocksStreak7()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        db.DailyActivities.AddRange(Enumerable.Range(0, 7).Select(d => new DailyActivity { UserId = userId, Date = today.AddDays(-d) }));
        await db.SaveChangesAsync();

        await new MilestoneService(db).CheckAndUnlockMilestones(userId, season.Id);

        var slugs = await UnlockedSlugs(db, userId, season.Id);
        Assert.Contains("streak-7", slugs);
    }

    [Fact]
    public async Task CheckAndUnlockMilestones_WeeklyTargetHit_UnlocksWeeklyTarget()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId, weeklyTarget: 2);
        db.Applications.AddRange(
            NewApp(userId, season.Id, appliedDate: DateTime.UtcNow),
            NewApp(userId, season.Id, appliedDate: DateTime.UtcNow));
        await db.SaveChangesAsync();

        await new MilestoneService(db).CheckAndUnlockMilestones(userId, season.Id);

        var slugs = await UnlockedSlugs(db, userId, season.Id);
        Assert.Contains("weekly-target", slugs);
    }

    [Fact]
    public async Task CheckAndUnlockMilestones_NoQualifyingActivity_UnlocksNothing()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var season = SeedSeason(db, userId);
        await db.SaveChangesAsync();

        await new MilestoneService(db).CheckAndUnlockMilestones(userId, season.Id);

        Assert.Empty(await UnlockedSlugs(db, userId, season.Id));
    }
}
