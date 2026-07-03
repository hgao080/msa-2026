using Roster.API.Models;

namespace Roster.API.Helpers;

public static class ApplicationStats
{
    public static ApplicationStatus ComputeStatus(Application app)
    {
        if (app.OfferedAt.HasValue) return ApplicationStatus.Offer;
        if (app.WithdrawnAt.HasValue) return ApplicationStatus.Withdrawn;
        if (app.Stages.Count == 0) return ApplicationStatus.Applied;

        var latest = app.Stages.OrderByDescending(s => s.CreatedAt).First();
        if (latest.Status == StageStatus.Failed) return ApplicationStatus.Rejected;
        return Enum.Parse<ApplicationStatus>(latest.Type.ToString());
    }

    // furthest stage type reached, not most recent — matches how companies actually gate rounds
    public static int PipelineLevel(Application app)
    {
        if (app.OfferedAt.HasValue) return 5;

        var level = 1;
        if (app.Stages.Any(s => s.Type is StageType.OA or StageType.PhoneScreen)) level = 2;
        if (app.Stages.Any(s => s.Type == StageType.Technical)) level = 3;
        if (app.Stages.Any(s => s.Type == StageType.Behavioural)) level = 4;
        return level;
    }

    public static double ResponseRate(IList<Application> apps)
    {
        if (apps.Count == 0) return 0;
        
        var responded = apps.Count(a =>
            a.Status != ApplicationStatus.Applied &&
            a.Status != ApplicationStatus.Withdrawn);
        return (double)responded / apps.Count;
    }

    public static int CurrentStreak(IList<DailyActivity> activities)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var sorted = activities.OrderByDescending(a => a.Date).ToList();

        if (sorted.Count == 0 || sorted[0].Date < today.AddDays(-1)) return 0;

        var streak = 0;
        var expected = today;
        foreach (var a in sorted)
        {
            if (a.Date >= expected.AddDays(-1) && a.Date <= expected)
            {
                streak++;
                expected = a.Date.AddDays(-1);
            }
            else break;
        }
        
        return streak;
    }

    public static int LongestStreak(IList<DailyActivity> activities)
    {
        var dates = activities.OrderBy(a => a.Date).Select(a => a.Date).ToList();
        if (dates.Count == 0) return 0;

        int longest = 1, current = 1;
        for (var i = 1; i < dates.Count; i++)
        {
            current = dates[i] == dates[i - 1].AddDays(1) ? current + 1 : 1;
            longest = Math.Max(longest, current);
        }
        
        return longest;
    }
}
