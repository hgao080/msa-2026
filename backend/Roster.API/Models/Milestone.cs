namespace Roster.API.Models;

public class Milestone
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<UserMilestone> UserMilestones { get; set; } = [];
}
