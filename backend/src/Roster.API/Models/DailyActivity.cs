namespace Roster.API.Models;

public class DailyActivity
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }

    public User User { get; set; } = null!;
}
