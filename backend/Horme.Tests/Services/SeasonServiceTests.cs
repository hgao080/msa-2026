using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.DTOs;
using Horme.API.Exceptions;
using Horme.API.Models;
using Horme.API.Services;

namespace Horme.Tests.Services;

public class SeasonServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateSeasonAsync_ValidRequest_PersistsSeason()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var service = new SeasonService(db);

        var dto = await service.CreateSeasonAsync(new CreateSeasonRequest("Grad Search", "Land a job", 5), userId);

        Assert.Equal("Grad Search", dto.Name);
        Assert.Equal("Active", dto.Status);
    }

    [Fact]
    public async Task GetSeasonsAsync_OnlyReturnsCallingUsersSeasons()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var service = new SeasonService(db);
        await service.CreateSeasonAsync(new CreateSeasonRequest("Mine", null, 5), userId);
        await service.CreateSeasonAsync(new CreateSeasonRequest("Theirs", null, 5), Guid.NewGuid());

        var seasons = await service.GetSeasonsAsync(userId);

        Assert.Single(seasons);
        Assert.Equal("Mine", seasons[0].Name);
    }

    [Fact]
    public async Task GetSeasonAsync_OtherUsersSeason_ThrowsNotFound()
    {
        using var db = CreateDb();
        var service = new SeasonService(db);
        var season = await service.CreateSeasonAsync(new CreateSeasonRequest("Season", null, 5), Guid.NewGuid());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.GetSeasonAsync(season.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateSeasonAsync_PartialFields_OnlyUpdatesProvidedFields()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var service = new SeasonService(db);
        var season = await service.CreateSeasonAsync(new CreateSeasonRequest("Season", "Original goal", 5), userId);

        var updated = await service.UpdateSeasonAsync(season.Id, userId, new UpdateSeasonRequest(null, "New goal", null));

        Assert.Equal("Season", updated.Name);
        Assert.Equal("New goal", updated.Goal);
        Assert.Equal(5, updated.WeeklyTarget);
    }

    [Fact]
    public async Task CloseSeasonAsync_ArchivesAndSnapshotsStats()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var service = new SeasonService(db);
        var season = await service.CreateSeasonAsync(new CreateSeasonRequest("Season", null, 5), userId);
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
        await db.SaveChangesAsync();

        var closed = await service.CloseSeasonAsync(season.Id, userId, "Accepted an offer");

        Assert.Equal("Archived", closed.Status);
        Assert.Equal("Accepted an offer", closed.Outcome);
        Assert.Equal(1, closed.FinalApplicationCount);
        Assert.Equal(1, closed.FinalOfferCount);
        Assert.NotNull(closed.EndDate);
    }

    [Fact]
    public async Task CloseSeasonAsync_AlreadyArchived_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var service = new SeasonService(db);
        var season = await service.CreateSeasonAsync(new CreateSeasonRequest("Season", null, 5), userId);
        await service.CloseSeasonAsync(season.Id, userId, null);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CloseSeasonAsync(season.Id, userId, null));
    }

    [Fact]
    public async Task CreateSeasonAsync_NameTooLong_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var service = new SeasonService(db);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreateSeasonAsync(new CreateSeasonRequest(new string('a', 101), null, 5), Guid.NewGuid()));
    }

    [Fact]
    public async Task CloseSeasonAsync_OutcomeTooLong_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var service = new SeasonService(db);
        var season = await service.CreateSeasonAsync(new CreateSeasonRequest("Season", null, 5), userId);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CloseSeasonAsync(season.Id, userId, new string('a', 201)));
    }

    [Fact]
    public async Task CloseSeasonAsync_OtherUsersSeason_ThrowsNotFound()
    {
        using var db = CreateDb();
        var service = new SeasonService(db);
        var season = await service.CreateSeasonAsync(new CreateSeasonRequest("Season", null, 5), Guid.NewGuid());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.CloseSeasonAsync(season.Id, Guid.NewGuid(), null));
    }
}
