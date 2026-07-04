namespace Roster.API.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; }

    public ICollection<Season> Seasons { get; set; } = [];
    public ICollection<UserMilestone> UserMilestones { get; set; } = [];
    public ICollection<DailyActivity> DailyActivities { get; set; } = [];
}
