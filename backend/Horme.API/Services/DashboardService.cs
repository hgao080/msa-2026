using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.DTOs;
using Horme.API.Helpers;
using Horme.API.Models;

namespace Horme.API.Services;

public class DashboardService(AppDbContext db)
{
    public static List<FunnelStageDto> CalculateFunnel(List<Application> applications)
    {
        var total = applications.Count;
        var responded = applications.Count(a =>
            a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn);
        var interviewed = applications.Count(a =>
            a.Stages.Count != 0 || a.Status == ApplicationStatus.Offer);
        var final = applications.Count(a =>
            a.Status is ApplicationStatus.Behavioural or ApplicationStatus.Offer);
        var offer = applications.Count(a => a.Status == ApplicationStatus.Offer);

        return
        [
            new FunnelStageDto("Applied", total, null),
            new FunnelStageDto("Responded", responded, total > 0 ? (double)responded / total : null),
            new FunnelStageDto("Interview", interviewed, responded > 0 ? (double)interviewed / responded : null),
            new FunnelStageDto("Final round", final, interviewed > 0 ? (double)final / interviewed : null),
            new FunnelStageDto("Offer", offer, final > 0 ? (double)offer / final : null),
        ];
    }

    public async Task<DashboardDto> GetDashboardAsync(Guid seasonId, Guid userId)
    {
        var season = await db.Seasons
                         .FirstOrDefaultAsync(s => s.Id == seasonId && s.UserId == userId)
                     ?? throw new Exceptions.NotFoundException("Season not found");

        var apps = await db.Applications
            .Include(a => a.Stages)
            .Where(a => a.SeasonId == seasonId && a.UserId == userId)
            .ToListAsync();

        var today = DateTime.UtcNow;
        var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);
        var weeklyProgress = apps.Count(a => a.AppliedDate >= thisWeekStart);

        var appsByWeek = apps
            .GroupBy(a => (
                System.Globalization.ISOWeek.GetYear(a.AppliedDate),
                System.Globalization.ISOWeek.GetWeekOfYear(a.AppliedDate)))
            .Select(g => g.Count())
            .ToList();
        var bestWeek = appsByWeek.Count != 0 ? appsByWeek.Max() : 0;

        var activities = await db.DailyActivities
            .Where(a => a.UserId == userId)
            .ToListAsync();

        var currentStreak = ApplicationStats.CurrentStreak(activities);
        var longestStreak = ApplicationStats.LongestStreak(activities);
        var responseRate = ApplicationStats.ResponseRate(apps);

        var seasonStart = DateOnly.FromDateTime(season.StartDate);
        var activityDates = activities
            .Where(a => a.Date >= seasonStart)
            .Select(a => a.Date)
            .ToHashSet();

        var heatmap = new List<HeatmapDayDto>();
        for (var d = seasonStart; d <= DateOnly.FromDateTime(today); d = d.AddDays(1))
            heatmap.Add(new HeatmapDayDto(d.ToString("yyyy-MM-dd"), activityDates.Contains(d)));

        var allMilestones = await db.Milestones.ToListAsync();
        var unlockedMilestones = await db.UserMilestones
            .Where(um => um.UserId == userId && um.SeasonId == seasonId)
            .ToListAsync();

        var milestones = allMilestones.Select(m =>
        {
            var unlocked = unlockedMilestones.FirstOrDefault(um => um.MilestoneId == m.Id);
            return new MilestoneStatusDto(
                new MilestoneDto(m.Id, m.Slug, m.Name, m.Description),
                unlocked?.UnlockedAt.ToString("o"));
        }).ToList();

        var seasonDto = ToSeasonDto(season);
        var stats = new StatsDto(
            apps.Count,
            responseRate, 
            apps.SelectMany(a => a.Stages).Count(),
            currentStreak,
            longestStreak,
            weeklyProgress,
            season.WeeklyTarget,
            new PersonalBestsDto(bestWeek, longestStreak));

        return new DashboardDto(
            seasonDto,
            stats, 
            CalculateFunnel(apps), 
            null, 
            heatmap, 
            milestones);
    }

    public static SeasonDto ToSeasonDto(Season s) => new(
        s.Id,
        s.UserId, 
        s.Name,
        s.Goal,
        s.WeeklyTarget,
        s.Status.ToString(),
        s.StartDate,
        s.EndDate,
        s.Outcome,
        s.FinalApplicationCount,
        s.FinalResponseRate,
        s.FinalInterviewCount,
        s.FinalOfferCount,
        s.FinalStreakDays
    );
}