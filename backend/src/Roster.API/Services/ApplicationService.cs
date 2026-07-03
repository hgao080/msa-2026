using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.DTOs;
using Roster.API.Exceptions;
using Roster.API.Helpers;
using Roster.API.Models;

namespace Roster.API.Services;

public class ApplicationService(AppDbContext db, MilestoneService milestoneService)
{
    private async Task LogActivity(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var exists = await db.DailyActivities.AnyAsync(a => a.UserId == userId && a.Date == today);
        if (!exists)
            db.DailyActivities.Add(new DailyActivity { UserId = userId, Date = today });
    }

    public async Task<List<ApplicationDto>> GetApplicationsAsync(Guid seasonId, Guid userId, string? status,
        string? source, string? sort, string? order)
    {
        var seasonExists = await db.Seasons.AnyAsync(s => s.Id == seasonId && s.UserId == userId);
        if (!seasonExists) throw new NotFoundException("Season not found");

        var query = db.Applications
            .Include(a => a.Stages)
            .Where(a => a.SeasonId == seasonId && a.UserId == userId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ApplicationStatus>(status, out var s))
            query = query.Where(a => a.Status == s);

        if (!string.IsNullOrEmpty(source) && Enum.TryParse<ApplicationSource>(source, out var src))
            query = query.Where(a => a.Source == src);

        var apps = await query.ToListAsync();

        apps = (sort, order?.ToLower() == "desc") switch
        {
            ("company", false) => apps.OrderBy(a => a.Company).ToList(),
            ("company", true) => apps.OrderByDescending(a => a.Company).ToList(),
            ("lastUpdated", false) => apps.OrderBy(a => a.LastUpdated).ToList(),
            ("lastUpdated", true) => apps.OrderByDescending(a => a.LastUpdated).ToList(),
            (_, false) => apps.OrderBy(a => a.AppliedDate).ToList(),
            (_, true) => apps.OrderByDescending(a => a.AppliedDate).ToList(),
        };

        return apps.Select(ToDto).ToList();
    }

    public async Task<ApplicationDto> GetApplicationAsync(Guid id, Guid userId)
    {
        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");
        
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
        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");

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
        var app = await db.Applications
                      .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");
        db.Applications.Remove(app);
        await db.SaveChangesAsync();
    }

    public async Task<ApplicationDto> OfferAsync(Guid id, Guid userId)
    {
        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");

        app.OfferedAt = DateTime.UtcNow;
        app.Status = ApplicationStats.ComputeStatus(app);
        app.LastUpdated = DateTime.UtcNow;
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);

        return ToDto(app);
    }

    public async Task<ApplicationDto> UnofferAsync(Guid id, Guid userId)
    {
        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");

        app.OfferedAt = null;
        app.Status = ApplicationStats.ComputeStatus(app);
        app.LastUpdated = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return ToDto(app);
    }

    public async Task<ApplicationDto> WithdrawAsync(Guid id, Guid userId)
    {
        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");

        app.WithdrawnAt = DateTime.UtcNow;
        app.Status = ApplicationStats.ComputeStatus(app);
        app.LastUpdated = DateTime.UtcNow;
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);

        return ToDto(app);
    }

    public async Task<ApplicationDto> UnwithdrawAsync(Guid id, Guid userId)
    {
        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");

        app.WithdrawnAt = null;
        app.Status = ApplicationStats.ComputeStatus(app);
        app.LastUpdated = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return ToDto(app);
    }

    public async Task<ApplicationStageDto> AddStageAsync(Guid appId, Guid userId, CreateStageRequest request)
    {
        if (!Enum.TryParse<StageType>(request.Type, out var type))
            throw new BadRequestException("Invalid stage type");

        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == appId && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");

        var stage = new ApplicationStage
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            Type = type,
            ScheduledDate = request.ScheduledDate
        };
        db.ApplicationStages.Add(stage);
        app.Status = ApplicationStats.ComputeStatus(app);
        app.LastUpdated = DateTime.UtcNow;
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);

        return ToStageDto(stage);
    }

    public async Task<ApplicationStageDto> UpdateStageAsync(Guid appId, Guid userId, Guid stageId,
        UpdateStageRequest request)
    {
        var app = await db.Applications
                      .Include(a => a.Stages)
                      .FirstOrDefaultAsync(a => a.Id == appId && a.UserId == userId)
                  ?? throw new NotFoundException("Application not found");

        var stage = app.Stages.FirstOrDefault(s => s.Id == stageId)
                    ?? throw new NotFoundException("Stage not found");

        if (request.Status != null && Enum.TryParse<StageStatus>(request.Status, out var st))
            stage.Status = st;
        if (request.CompletedDate.HasValue) stage.CompletedDate = request.CompletedDate;
        if (request.Notes != null) stage.Notes = request.Notes;
        app.Status = ApplicationStats.ComputeStatus(app);
        app.LastUpdated = DateTime.UtcNow;
        await LogActivity(userId);
        await db.SaveChangesAsync();
        await milestoneService.CheckAndUnlockMilestones(userId, app.SeasonId);
        
        return ToStageDto(stage);
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