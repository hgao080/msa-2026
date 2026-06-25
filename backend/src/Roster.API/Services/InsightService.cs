using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.DTOs;
using Roster.API.Models;

namespace Roster.API.Services;

public class InsightService
{
    private readonly AppDbContext _db;
    private readonly DashboardService _dashboardService;

    public InsightService(AppDbContext db, DashboardService dashboardService)
    {
        _db = db;
        _dashboardService = dashboardService;
    }

    public async Task<List<InsightDto>> GetInsightsAsync(Guid userId, Guid seasonId)
    {
        var apps = await _db.Applications
            .Include(a => a.Stages)
            .Where(a => a.SeasonId == seasonId && a.UserId == userId)
            .ToListAsync();

        var today = DateTime.UtcNow;
        var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);
        var insights = new List<InsightDto>();

        var streak = _dashboardService.CalculateCurrentStreak(userId);
        var activeToday = await _db.DailyActivities.AnyAsync(a =>
            a.UserId == userId && a.Date == DateOnly.FromDateTime(today));

        if (streak > 3 && !activeToday)
            insights.Add(new("streak-at-risk",
                $"You're on a {streak}-day streak. You haven't logged anything today — keep it going.",
                1));

        var bySource = apps
            .GroupBy(a => a.Source)
            .Where(g => g.Count() >= 3)
            .Select(g => new
            {
                Source = g.Key.ToString(),
                Rate = g.Count(a => a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn) / (double)g.Count()
            })
            .OrderByDescending(s => s.Rate)
            .ToList();

        if (bySource.Count >= 2 && bySource[0].Rate >= bySource[^1].Rate * 2)
            insights.Add(new("source-performance",
                $"{bySource[0].Source} applications are converting at {bySource[0].Rate:P0} vs {bySource[^1].Source} at {bySource[^1].Rate:P0}. Focus where it's working.",
                2));

        var technicalRejections = apps.Count(a => a.Status == ApplicationStatus.Rejected &&
            a.Stages.Any(s => s.Type == StageType.Technical && s.Status == StageStatus.Failed));
        if (technicalRejections >= 2)
            insights.Add(new("stage-dropoff",
                $"You've dropped off at the technical interview stage {technicalRejections} times this season. Consider focusing your prep there.",
                3));

        var thisWeekApps = apps.Where(a => a.AppliedDate >= thisWeekStart).ToList();
        var lastWeekApps = apps.Where(a => a.AppliedDate >= thisWeekStart.AddDays(-7) && a.AppliedDate < thisWeekStart).ToList();
        if (thisWeekApps.Count >= 2 && lastWeekApps.Count >= 2)
        {
            var thisRate = thisWeekApps.Count(a => a.Status != ApplicationStatus.Applied) / (double)thisWeekApps.Count;
            var lastRate = lastWeekApps.Count(a => a.Status != ApplicationStatus.Applied) / (double)lastWeekApps.Count;
            if (thisRate >= lastRate + 0.10)
                insights.Add(new("response-rate-up",
                    $"Your response rate this week ({thisRate:P0}) is up from last week ({lastRate:P0}). Something's working.",
                    4));
        }

        var stale = apps.Count(a =>
            a.Status == ApplicationStatus.Applied &&
            (today - a.AppliedDate).TotalDays > 14);
        if (stale > 0)
            insights.Add(new("follow-up-needed",
                $"{stale} application{(stale > 1 ? "s are" : " is")} past 14 days with no response. Worth chasing up.",
                5));

        var season = await _db.Seasons.FindAsync(seasonId);
        if (season != null)
        {
            var thisWeekCount = apps.Count(a => a.AppliedDate >= thisWeekStart);
            var dayOfWeek = (int)today.DayOfWeek;
            if (dayOfWeek is 3 or 4)
            {
                if (thisWeekCount < season.WeeklyTarget * 0.3)
                    insights.Add(new("weekly-behind",
                        $"Only {thisWeekCount}/{season.WeeklyTarget} applications this week. You've still got time to catch up.",
                        6));
                else if (thisWeekCount >= season.WeeklyTarget)
                    insights.Add(new("weekly-target-hit",
                        $"You've hit your weekly target of {season.WeeklyTarget}. Nice work.",
                        6));
            }
        }

        return insights.OrderBy(i => i.Priority).ToList();
    }
}
