namespace Horme.API.Models;

public class ApplicationStage
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public StageType Type { get; set; }
    public StageStatus Status { get; set; } = StageStatus.Upcoming;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string? Notes { get; set; }

    public Application Application { get; set; } = null!;
}

public enum StageType { OA, PhoneScreen, Technical, Behavioural }
public enum StageStatus { Upcoming, Completed, Failed }
