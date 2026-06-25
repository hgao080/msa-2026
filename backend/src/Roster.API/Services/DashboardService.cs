using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.DTOs;
using Roster.API.Models;

namespace Roster.API.Services;

public class DashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public int CalculateCurrentStreak(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var activities = _db.DailyActivities
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Date)
            .ToList();

        if (!activities.Any()) return 0;
        if (activities.First().Date < today.AddDays(-1)) return 0;

        int streak = 0;
        var expected = today;
        foreach (var activity in activities)
        {
            if (activity.Date >= expected.AddDays(-1) && activity.Date <= expected)
            {
                streak++;
                expected = activity.Date.AddDays(-1);
            }
            else break;
        }
        return streak;
    }

    public int CalculateLongestStreak(Guid userId)
    {
        var activities = _db.DailyActivities
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.Date)
            .Select(a => a.Date)
            .ToList();

        if (!activities.Any()) return 0;

        int longest = 1, current = 1;
        for (int i = 1; i < activities.Count; i++)
        {
            if (activities[i] == activities[i - 1].AddDays(1))
                current++;
            else
                current = 1;
            longest = Math.Max(longest, current);
        }
        return longest;
    }

    public List<FunnelStageDto> CalculateFunnel(List<Application> applications)
    {
        int total = applications.Count;
        int responded = applications.Count(a =>
            a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn);
        int interviewed = applications.Count(a =>
            a.Stages.Any() || (int)a.Status >= (int)ApplicationStatus.Screening);
        int final = applications.Count(a =>
            a.Status == ApplicationStatus.Final || a.Status == ApplicationStatus.Offer);
        int offer = applications.Count(a => a.Status == ApplicationStatus.Offer);

        return
        [
            new("Applied",     total,      null),
            new("Responded",   responded,  total > 0 ? (double)responded / total : null),
            new("Interview",   interviewed, responded > 0 ? (double)interviewed / responded : null),
            new("Final round", final,       interviewed > 0 ? (double)final / interviewed : null),
            new("Offer",       offer,       final > 0 ? (double)offer / final : null),
        ];
    }

    public async Task<DashboardDto> GetDashboardAsync(Guid seasonId, Guid userId)
    {
        var season = await _db.Seasons
            .FirstOrDefaultAsync(s => s.Id == seasonId && s.UserId == userId)
            ?? throw new Exceptions.NotFoundException("Season not found");

        var apps = await _db.Applications
            .Include(a => a.Stages)
            .Where(a => a.SeasonId == seasonId && a.UserId == userId)
            .ToListAsync();

        var today = DateTime.UtcNow;
        var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);
        var weeklyProgress = apps.Count(a => a.AppliedDate >= thisWeekStart);

        var appsByWeek = apps
            .GroupBy(a => System.Globalization.ISOWeek.GetWeekOfYear(a.AppliedDate))
            .Select(g => g.Count())
            .ToList();
        var bestWeek = appsByWeek.Any() ? appsByWeek.Max() : 0;

        var currentStreak = CalculateCurrentStreak(userId);
        var longestStreak = CalculateLongestStreak(userId);

        var responded = apps.Count(a =>
            a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn);
        var responseRate = apps.Count > 0 ? (double)responded / apps.Count : 0;

        var heatmap = new List<HeatmapDayDto>();
        var activityDates = await _db.DailyActivities
            .Where(a => a.UserId == userId && a.Date >= DateOnly.FromDateTime(season.StartDate))
            .Select(a => a.Date)
            .ToHashSetAsync();

        for (var d = DateOnly.FromDateTime(season.StartDate); d <= DateOnly.FromDateTime(today); d = d.AddDays(1))
            heatmap.Add(new(d.ToString("yyyy-MM-dd"), activityDates.Contains(d)));

        var allMilestones = await _db.Milestones.ToListAsync();
        var unlockedMilestones = await _db.UserMilestones
            .Where(um => um.UserId == userId && um.SeasonId == seasonId)
            .ToListAsync();

        var milestones = allMilestones.Select(m =>
        {
            var unlocked = unlockedMilestones.FirstOrDefault(um => um.MilestoneId == m.Id);
            return new MilestoneStatusDto(
                new MilestoneDto(m.Id, m.Slug, m.Name, m.Description),
                unlocked?.UnlockedAt.ToString("o")
            );
        }).ToList();

        var seasonDto = ToSeasonDto(season);
        var stats = new StatsDto(
            apps.Count, responseRate, apps.SelectMany(a => a.Stages).Count(),
            currentStreak, longestStreak, weeklyProgress, season.WeeklyTarget,
            new PersonalBestsDto(bestWeek, longestStreak)
        );

        return new DashboardDto(seasonDto, stats, CalculateFunnel(apps), null, heatmap, milestones);
    }

    public static SeasonDto ToSeasonDto(Season s) => new(
        s.Id, s.UserId, s.Name, s.Goal, s.WeeklyTarget, s.Status.ToString(),
        s.StartDate, s.EndDate, s.Outcome, s.FinalApplicationCount, s.FinalResponseRate,
        s.FinalInterviewCount, s.FinalOfferCount, s.FinalStreakDays
    );
}
