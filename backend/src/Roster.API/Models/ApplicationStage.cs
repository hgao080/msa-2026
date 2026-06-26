namespace Roster.API.Models;

public class ApplicationStage
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public StageType Type { get; set; }
    public StageStatus Status { get; set; } = StageStatus.Upcoming;
    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string? Notes { get; set; }

    public Application Application { get; set; } = null!;
}

public enum StageType { OA, PhoneScreen, Technical, Behavioural, Final }
public enum StageStatus { Upcoming, Completed, Failed }
