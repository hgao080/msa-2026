using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.DTOs;
using Horme.API.Exceptions;
using Horme.API.Models;
using Horme.API.Services;

namespace Horme.Tests.Services;

public class ApplicationServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static ApplicationService CreateService(AppDbContext db) =>
        new(db, new MilestoneService(db));

    private static async Task<(Guid userId, Guid seasonId)> SeedSeason(AppDbContext db)
    {
        var userId = Guid.NewGuid();
        var season = new Season { Id = Guid.NewGuid(), UserId = userId, Name = "Season", WeeklyTarget = 5, StartDate = DateTime.UtcNow };
        db.Seasons.Add(season);
        await db.SaveChangesAsync();
        return (userId, season.Id);
    }

    private static CreateApplicationRequest ValidRequest(string company = "Acme") =>
        new(company, "Engineer", null, "LinkedIn", DateTime.UtcNow, null, null);

    [Fact]
    public async Task CreateApplicationAsync_ValidRequest_PersistsApplication()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);

        var dto = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        Assert.Equal("Acme", dto.Company);
        Assert.Equal("Applied", dto.Status);
        Assert.Single(db.DailyActivities);
    }

    [Fact]
    public async Task CreateApplicationAsync_SeasonBelongsToOtherUser_ThrowsNotFound()
    {
        using var db = CreateDb();
        var (_, seasonId) = await SeedSeason(db);
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.CreateApplicationAsync(seasonId, Guid.NewGuid(), ValidRequest()));
    }

    [Fact]
    public async Task CreateApplicationAsync_InvalidSource_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var request = new CreateApplicationRequest("Acme", "Engineer", null, "NotARealSource", DateTime.UtcNow, null, null);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreateApplicationAsync(seasonId, userId, request));
    }

    [Fact]
    public async Task CreateApplicationAsync_CompanyTooLong_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var request = ValidRequest(new string('a', 201));

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreateApplicationAsync(seasonId, userId, request));
    }

    [Fact]
    public async Task UpdateApplicationAsync_NotesTooLong_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());
        var request = new UpdateApplicationRequest(null, null, null, null, new string('a', 2001));

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.UpdateApplicationAsync(app.Id, userId, request));
    }

    [Fact]
    public async Task GetApplicationAsync_OtherUsersApplication_ThrowsNotFound()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.GetApplicationAsync(app.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateApplicationAsync_PartialFields_OnlyUpdatesProvidedFields()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        var updated = await service.UpdateApplicationAsync(app.Id, userId,
            new UpdateApplicationRequest(null, "Senior Engineer", null, null, null));

        Assert.Equal("Acme", updated.Company);
        Assert.Equal("Senior Engineer", updated.Role);
    }

    [Fact]
    public async Task DeleteApplicationAsync_OtherUsersApplication_ThrowsNotFound()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.DeleteApplicationAsync(app.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task DeleteApplicationAsync_OwnApplication_RemovesIt()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        await service.DeleteApplicationAsync(app.Id, userId);

        Assert.Empty(db.Applications);
    }

    [Fact]
    public async Task OfferAsync_SetsOfferedAtAndOfferStatus()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        var offered = await service.OfferAsync(app.Id, userId);

        Assert.NotNull(offered.OfferedAt);
        Assert.Equal("Offer", offered.Status);
    }

    [Fact]
    public async Task UnofferAsync_ClearsOfferedAt()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());
        await service.OfferAsync(app.Id, userId);

        var unoffered = await service.UnofferAsync(app.Id, userId);

        Assert.Null(unoffered.OfferedAt);
        Assert.Equal("Applied", unoffered.Status);
    }

    [Fact]
    public async Task WithdrawAsync_SetsWithdrawnAtAndStatus()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        var withdrawn = await service.WithdrawAsync(app.Id, userId);

        Assert.NotNull(withdrawn.WithdrawnAt);
        Assert.Equal("Withdrawn", withdrawn.Status);
    }

    [Fact]
    public async Task UnwithdrawAsync_ClearsWithdrawnAt()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());
        await service.WithdrawAsync(app.Id, userId);

        var unwithdrawn = await service.UnwithdrawAsync(app.Id, userId);

        Assert.Null(unwithdrawn.WithdrawnAt);
        Assert.Equal("Applied", unwithdrawn.Status);
    }

    [Fact]
    public async Task AddStageAsync_InvalidType_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.AddStageAsync(app.Id, userId, new CreateStageRequest("NotAStage", null)));
    }

    [Fact]
    public async Task AddStageAsync_ValidType_AddsStageAndRecomputesStatus()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        var stage = await service.AddStageAsync(app.Id, userId, new CreateStageRequest("Technical", null));
        var refreshed = await service.GetApplicationAsync(app.Id, userId);

        Assert.Equal("Technical", stage.Type);
        Assert.Equal("Technical", refreshed.Status);
    }

    [Fact]
    public async Task UpdateStageAsync_UnknownStage_ThrowsNotFound()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.UpdateStageAsync(app.Id, userId, Guid.NewGuid(),
                new UpdateStageRequest(null, "Completed", null, null, null)));
    }

    [Fact]
    public async Task UpdateStageAsync_FailedStage_RecomputesApplicationAsRejected()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());
        var stage = await service.AddStageAsync(app.Id, userId, new CreateStageRequest("Technical", null));

        await service.UpdateStageAsync(app.Id, userId, stage.Id,
            new UpdateStageRequest(null, "Failed", null, null, null));
        var refreshed = await service.GetApplicationAsync(app.Id, userId);

        Assert.Equal("Rejected", refreshed.Status);
    }

    [Fact]
    public async Task DeleteStageAsync_RemovesStageAndRecomputesStatus()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        var app = await service.CreateApplicationAsync(seasonId, userId, ValidRequest());
        var stage = await service.AddStageAsync(app.Id, userId, new CreateStageRequest("Technical", null));

        await service.DeleteStageAsync(app.Id, userId, stage.Id);
        var refreshed = await service.GetApplicationAsync(app.Id, userId);

        Assert.Empty(refreshed.Stages);
        Assert.Equal("Applied", refreshed.Status);
    }

    [Fact]
    public async Task GetApplicationsAsync_ReturnsAllApplicationsForSeason()
    {
        using var db = CreateDb();
        var (userId, seasonId) = await SeedSeason(db);
        var service = CreateService(db);
        await service.CreateApplicationAsync(seasonId, userId, ValidRequest("Atlassian"));
        await service.CreateApplicationAsync(seasonId, userId, ValidRequest("Canva"));

        var results = await service.GetApplicationsAsync(seasonId, userId);

        Assert.Equal(2, results.Count);
    }

    [Fact]
    public async Task GetApplicationsAsync_OtherUsersSeason_ThrowsNotFound()
    {
        using var db = CreateDb();
        var (_, seasonId) = await SeedSeason(db);
        var service = CreateService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.GetApplicationsAsync(seasonId, Guid.NewGuid()));
    }
}
