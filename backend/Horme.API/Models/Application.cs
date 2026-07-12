namespace Horme.API.Models;

public class Application
{
    public Guid Id { get; set; }
    public Guid SeasonId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? JobPostingUrl { get; set; }
    public ApplicationSource Source { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    public DateTime AppliedDate { get; set; }
    public DateTime LastUpdated { get; set; }
    public string? ReferrerName { get; set; }
    public string? Notes { get; set; }
    public DateTime? OfferedAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }

    public Season Season { get; set; } = null!;
    public ICollection<ApplicationStage> Stages { get; set; } = [];
}

public enum ApplicationSource { LinkedIn, Seek, Referral, CompanyWebsite, Other }
public enum ApplicationStatus { Applied, Oa, PhoneScreen, Technical, Behavioural, Offer, Rejected, Withdrawn }
