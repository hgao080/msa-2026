using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.Models;

namespace Roster.API.Services;

public class MilestoneService
{
    private readonly AppDbContext _db;
    private readonly DashboardService _dashboardService;

    public MilestoneService(AppDbContext db, DashboardService dashboardService)
    {
        _db = db;
        _dashboardService = dashboardService;
    }

    public async Task CheckAndUnlockMilestones(Guid userId, Guid seasonId)
    {
        var allMilestones = await _db.Milestones.ToListAsync();
        var alreadyUnlocked = await _db.UserMilestones
            .Where(um => um.UserId == userId && um.SeasonId == seasonId)
            .Select(um => um.MilestoneId)
            .ToListAsync();

        var apps = await _db.Applications
            .Include(a => a.Stages)
            .Where(a => a.SeasonId == seasonId && a.UserId == userId)
            .ToListAsync();

        var season = await _db.Seasons.FindAsync(seasonId);
        var streak = _dashboardService.CalculateCurrentStreak(userId);
        var thisWeekStart = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var thisWeekCount = apps.Count(a => a.AppliedDate >= thisWeekStart);

        var newUnlocks = new List<UserMilestone>();

        foreach (var milestone in allMilestones.Where(m => !alreadyUnlocked.Contains(m.Id)))
        {
            bool earned = milestone.Slug switch
            {
                "first-application"        => apps.Count >= 1,
                "ten-applications"         => apps.Count >= 10,
                "twenty-five-applications" => apps.Count >= 25,
                "first-response"           => apps.Any(a => a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn),
                "first-interview"          => apps.Any(a => a.Stages.Any()),
                "five-interviews"          => apps.SelectMany(a => a.Stages).Count(s => s.Status == StageStatus.Completed) >= 5,
                "first-offer"              => apps.Any(a => a.Status == ApplicationStatus.Offer),
                "streak-7"                 => streak >= 7,
                "streak-14"                => streak >= 14,
                "streak-30"                => streak >= 30,
                "weekly-target"            => season != null && thisWeekCount >= season.WeeklyTarget,
                _                          => false
            };

            if (earned)
            {
                newUnlocks.Add(new UserMilestone
                {
                    UserId = userId,
                    MilestoneId = milestone.Id,
                    SeasonId = seasonId,
                    UnlockedAt = DateTime.UtcNow
                });
            }
        }

        if (newUnlocks.Count != 0)
        {
            _db.UserMilestones.AddRange(newUnlocks);
            await _db.SaveChangesAsync();
        }
    }
}
