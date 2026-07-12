using Microsoft.EntityFrameworkCore;
using Horme.API.Data;
using Horme.API.Helpers;
using Horme.API.Models;

namespace Horme.API.Services;

public class MilestoneService(AppDbContext db)
{
    public async Task CheckAndUnlockMilestones(Guid userId, Guid seasonId)
    {
        var allMilestones = await db.Milestones.ToListAsync();
        var alreadyUnlocked = await db.UserMilestones
            .Where(um => um.UserId == userId && um.SeasonId == seasonId)
            .Select(um => um.MilestoneId)
            .ToListAsync();

        var apps = await db.Applications
            .Include(a => a.Stages)
            .Where(a => a.SeasonId == seasonId && a.Season.UserId == userId)
            .ToListAsync();

        var activities = await db.DailyActivities
            .Where(a => a.UserId == userId)
            .ToListAsync();

        var season = await db.Seasons.FindAsync(seasonId);
        var streak = ApplicationStats.CurrentStreak(activities);
        var thisWeekStart = ApplicationStats.StartOfWeek(DateTime.UtcNow);
        var thisWeekCount = apps.Count(a => a.AppliedDate >= thisWeekStart);

        var newUnlocks = (from milestone in allMilestones.Where(m => !alreadyUnlocked.Contains(m.Id))
            let earned = milestone.Slug switch
            {
                "first-application" => apps.Count >= 1,
                "ten-applications" => apps.Count >= 10,
                "twenty-five-applications" => apps.Count >= 25,
                "first-response" => apps.Any(a => a.Status != ApplicationStatus.Applied && a.Status != ApplicationStatus.Withdrawn),
                "first-interview" => apps.Any(a => a.Stages.Any()),
                "five-interviews" => apps.SelectMany(a => a.Stages).Count(s => s.Status == StageStatus.Completed) >= 5,
                "first-offer" => apps.Any(a => a.Status == ApplicationStatus.Offer),
                "streak-7" => streak >= 7,
                "streak-14" => streak >= 14,
                "streak-30" => streak >= 30,
                "weekly-target" => season != null && thisWeekCount >= season.WeeklyTarget,
                _ => false
            }
            where earned
            select new UserMilestone 
            {
                UserId = userId, 
                MilestoneId = milestone.Id, 
                SeasonId = seasonId, 
                UnlockedAt = 
                DateTime.UtcNow
            }).ToList();

        if (newUnlocks.Count != 0)
        {
            db.UserMilestones.AddRange(newUnlocks);
            await db.SaveChangesAsync();
        }
    }
}
