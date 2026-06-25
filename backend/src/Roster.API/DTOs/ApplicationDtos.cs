namespace Roster.API.DTOs;

public record CreateApplicationRequest(
    string Company,
    string Role,
    string? JobPostingUrl,
    string Source,
    DateTime AppliedDate,
    string? ReferrerName,
    string? Notes
);

public record UpdateApplicationRequest(
    string? Company,
    string? Role,
    string? JobPostingUrl,
    string? Source,
    string? Notes
);

public record PatchStatusRequest(string Status);

public record CreateStageRequest(string Type, DateTime? ScheduledDate);
public record UpdateStageRequest(string? Status, DateTime? CompletedDate, string? Notes);

public record ApplicationDto(
    Guid Id,
    Guid SeasonId,
    string Company,
    string Role,
    string? JobPostingUrl,
    string Source,
    string Status,
    DateTime AppliedDate,
    DateTime LastUpdated,
    string? ReferrerName,
    string? Notes,
    List<ApplicationStageDto> Stages
);

public record ApplicationStageDto(
    Guid Id,
    Guid ApplicationId,
    string Type,
    string Status,
    DateTime? ScheduledDate,
    DateTime? CompletedDate,
    string? Notes
);
