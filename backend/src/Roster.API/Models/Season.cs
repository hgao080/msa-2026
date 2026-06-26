namespace Roster.API.Models;

public class Season
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public int WeeklyTarget { get; set; } = 5;
    public SeasonStatus Status { get; set; } = SeasonStatus.Active;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Outcome { get; set; }

    public int? FinalApplicationCount { get; set; }
    public double? FinalResponseRate { get; set; }
    public int? FinalInterviewCount { get; set; }
    public int? FinalOfferCount { get; set; }
    public int? FinalStreakDays { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Application> Applications { get; set; } = [];
}

public enum SeasonStatus { Active, Archived }
