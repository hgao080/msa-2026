namespace Horme.API.Models;

public class UserMilestone
{
    public Guid UserId { get; set; }
    public Guid MilestoneId { get; set; }
    public Guid SeasonId { get; set; }
    public DateTime UnlockedAt { get; set; }

    public User User { get; set; } = null!;
    public Milestone Milestone { get; set; } = null!;
}
