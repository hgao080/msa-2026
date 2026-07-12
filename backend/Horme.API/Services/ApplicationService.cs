using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.DTOs;
using Horme.API.Exceptions;
using Horme.API.Helpers;
using Horme.API.Models;

namespace Horme.API.Services;

public class ApplicationService(AppDbContext db, MilestoneService milestoneService)
{
    private async Task LogActivity(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var exists = await db.DailyActivities.AnyAsync(a => a.UserId == userId && a.Date == today);
        if (!exists)
            db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today });
    }

    private async Task<Application> GetOwnedApplicationAsync(Guid id, Guid userId, bool includeStages = true)
    {
        var query = db.Applications.AsQueryable();
        if (includeStages) query = query.Include(a => a.Stages);

        return await query.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
               ?? throw new NotFoundException("Application not found");
    }

    private static void Touch(Application app)
    {
        app.Status = ApplicationStats.ComputeStatus(app);
        app.LastUpdated = DateTime.UtcNow;
    }

    public async Task<List<ApplicationDto>> GetApplicationsAsync(Guid seasonId, Guid userId)
    {
        var seasonExists = await db.Seasons.AnyAsync(s => s.Id == seasonId && s.UserId == userId);
        if (!seasonExists) throw new NotFoundException("Season not found");

        var apps = await db.Applications
            .Include(a => a.Stages)
            .Where(a => a.SeasonId == seasonId && a.UserId == userId)
            .ToListAsync();

        return apps.Select(ToDto).ToList();
    }

    public async Task<ApplicationDto> GetApplicationAsync(Guid id, Guid userId)
    {
        var app = await GetOwnedApplicationAsync(id, userId);

        return ToDto(app);
    }

    public async Task<ApplicationDto> CreateApplicationAsync(Guid seasonId, Guid userId,
        CreateApplicationRequest request)
    {
        var season = await db.Seasons.FirstOrDefaultAsync(s => s.Id == seasonId && s.UserId == userId)
                     ?? throw new NotFoundException("Season not found");

        if (!Enum.TryParse<ApplicationSource>(request.Source, out var source))
            throw new BadRequestException("Invalid source value");

        var app = new Application
        {
            Id = Guid.NewGuid(),
            SeasonId = seasonId,
            UserId = userId,
            Company = request.Company,
            Role = request.Role,
            JobPostingUrl = request.JobPostingUrl,
            Source = source,
            AppliedDate = request.AppliedDate,
            LastUpdated = DateTime.UtcNow,
            ReferrerName = request.ReferrerName,
            Notes = request.Notes
        };
        db.Applications.Add(app);
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, seasonId);
        
        return ToDto(app);
    }

    public async Task<ApplicationDto> UpdateApplicationAsync(Guid id, Guid userId, UpdateApplicationRequest request)
    {
        var app = await GetOwnedApplicationAsync(id, userId);

        if (request.Company != null) app.Company = request.Company;
        if (request.Role != null) app.Role = request.Role;
        if (request.JobPostingUrl != null) app.JobPostingUrl = request.JobPostingUrl;
        if (request.Notes != null) app.Notes = request.Notes;
        if (request.Source != null && Enum.TryParse<ApplicationSource>(request.Source, out var src))
            app.Source = src;
        app.LastUpdated = DateTime.UtcNow;
        await db.SaveChangesAsync();
        
        return ToDto(app);
    }

    public async Task DeleteApplicationAsync(Guid id, Guid userId)
    {
        var app = await GetOwnedApplicationAsync(id, userId, includeStages: false);
        db.Applications.Remove(app);
        await db.SaveChangesAsync();
    }

    public async Task<ApplicationDto> OfferAsync(Guid id, Guid userId)
    {
        var app = await GetOwnedApplicationAsync(id, userId);

        app.OfferedAt = DateTime.UtcNow;
        Touch(app);
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);

        return ToDto(app);
    }

    public async Task<ApplicationDto> UnofferAsync(Guid id, Guid userId)
    {
        var app = await GetOwnedApplicationAsync(id, userId);

        app.OfferedAt = null;
        Touch(app);
        await db.SaveChangesAsync();

        return ToDto(app);
    }

    public async Task<ApplicationDto> WithdrawAsync(Guid id, Guid userId)
    {
        var app = await GetOwnedApplicationAsync(id, userId);

        app.WithdrawnAt = DateTime.UtcNow;
        Touch(app);
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);

        return ToDto(app);
    }

    public async Task<ApplicationDto> UnwithdrawAsync(Guid id, Guid userId)
    {
        var app = await GetOwnedApplicationAsync(id, userId);

        app.WithdrawnAt = null;
        Touch(app);
        await db.SaveChangesAsync();

        return ToDto(app);
    }

    public async Task<ApplicationStageDto> AddStageAsync(Guid appId, Guid userId, CreateStageRequest request)
    {
        if (!Enum.TryParse<StageType>(request.Type, out var type))
            throw new BadRequestException("Invalid stage type");

        var app = await GetOwnedApplicationAsync(appId, userId);

        var stage = new ApplicationStage
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            Type = type,
            ScheduledDate = request.ScheduledDate
        };
        db.ApplicationStages.Add(stage);
        Touch(app);
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);

        return ToStageDto(stage);
    }

    public async Task<ApplicationStageDto> UpdateStageAsync(Guid appId, Guid userId, Guid stageId,
        UpdateStageRequest request)
    {
        var app = await GetOwnedApplicationAsync(appId, userId);

        var stage = app.Stages.FirstOrDefault(s => s.Id == stageId)
                    ?? throw new NotFoundException("Stage not found");

        if (request.Type != null && Enum.TryParse<StageType>(request.Type, out var ty))
            stage.Type = ty;
        if (request.Status != null && Enum.TryParse<StageStatus>(request.Status, out var st))
            stage.Status = st;
        if (request.ScheduledDate.HasValue) stage.ScheduledDate = request.ScheduledDate;
        if (request.CompletedDate.HasValue) stage.CompletedDate = request.CompletedDate;
        if (request.Notes != null) stage.Notes = request.Notes;
        Touch(app);
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);

        return ToStageDto(stage);
    }

    public async Task DeleteStageAsync(Guid appId, Guid userId, Guid stageId)
    {
        var app = await GetOwnedApplicationAsync(appId, userId);

        var stage = app.Stages.FirstOrDefault(s => s.Id == stageId)
                    ?? throw new NotFoundException("Stage not found");

        db.ApplicationStages.Remove(stage);
        app.Stages.Remove(stage);
        Touch(app);
        await db.SaveChangesAsync();
    }

    private static ApplicationDto ToDto(Application a) => new(
        a.Id,
        a.SeasonId,
        a.Company,
        a.Role,
        a.JobPostingUrl,
        a.Source.ToString(),
        a.Status.ToString(),
        a.AppliedDate,
        a.LastUpdated,
        a.ReferrerName,
        a.Notes,
        a.OfferedAt,
        a.WithdrawnAt,
        a.Stages.Select(ToStageDto).ToList()
    );

    private static ApplicationStageDto ToStageDto(ApplicationStage s) => new(
        s.Id,
        s.ApplicationId,
        s.Type.ToString(),
        s.Status.ToString(),
        s.ScheduledDate,
        s.CompletedDate,
        s.Notes
    );
}