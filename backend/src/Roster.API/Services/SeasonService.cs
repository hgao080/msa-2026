using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.DTOs;
using Roster.API.Exceptions;
using Roster.API.Helpers;
using Roster.API.Models;

namespace Roster.API.Services;

public class SeasonService(AppDbContext db)
{
    public async Task<List<SeasonDto>> GetSeasonsAsync(Guid userId)
    {
        var seasons = await db.Seasons
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartDate)
            .ToListAsync();
        return seasons.Select(DashboardService.ToSeasonDto).ToList();
    }

    public async Task<SeasonDto> GetSeasonAsync(Guid seasonId, Guid userId)
    {
        var season = await db.Seasons
            .FirstOrDefaultAsync(s => s.Id == seasonId && s.UserId == userId)
            ?? throw new NotFoundException("Season not found");
        return DashboardService.ToSeasonDto(season);
    }

    public async Task<SeasonDto> CreateSeasonAsync(CreateSeasonRequest request, Guid userId)
    {
        var season = new Season
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Goal = request.Goal,
            WeeklyTarget = request.WeeklyTarget,
            StartDate = DateTime.UtcNow
        };
        db.Seasons.Add(season);
        await db.SaveChangesAsync();
        return DashboardService.ToSeasonDto(season);
    }

    public async Task<SeasonDto> UpdateSeasonAsync(Guid seasonId, Guid userId, UpdateSeasonRequest request)
    {
        var season = await db.Seasons
            .FirstOrDefaultAsync(s => s.Id == seasonId && s.UserId == userId)
            ?? throw new NotFoundException("Season not found");

        if (request.Name != null) season.Name = request.Name;
        if (request.Goal != null) season.Goal = request.Goal;
        if (request.WeeklyTarget.HasValue) season.WeeklyTarget = request.WeeklyTarget.Value;

        await db.SaveChangesAsync();
        return DashboardService.ToSeasonDto(season);
    }

    public async Task<SeasonDto> CloseSeasonAsync(Guid seasonId, Guid userId, string? outcome)
    {
        var season = await db.Seasons
            .Include(s => s.Applications).ThenInclude(a => a.Stages)
            .FirstOrDefaultAsync(s => s.Id == seasonId && s.UserId == userId)
            ?? throw new NotFoundException("Season not found");

        if (season.Status == SeasonStatus.Archived)
            throw new BadRequestException("Season is already archived");

        var apps = season.Applications.ToList();
        var activities = await db.DailyActivities
            .Where(a => a.UserId == userId)
            .ToListAsync();

        season.Status = SeasonStatus.Archived;
        season.EndDate = DateTime.UtcNow;
        season.Outcome = outcome;
        season.FinalApplicationCount = apps.Count;
        season.FinalResponseRate = ApplicationStats.ResponseRate(apps);
        season.FinalInterviewCount = apps.SelectMany(a => a.Stages).Count();
        season.FinalOfferCount = apps.Count(a => a.Status == ApplicationStatus.Offer);
        season.FinalStreakDays = ApplicationStats.LongestStreak(activities);

        await db.SaveChangesAsync();
        return DashboardService.ToSeasonDto(season);
    }
}
