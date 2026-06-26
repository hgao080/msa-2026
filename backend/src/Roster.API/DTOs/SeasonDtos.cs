namespace Roster.API.DTOs;

public record CreateSeasonRequest(string Name, string? Goal, int WeeklyTarget = 5);
public record UpdateSeasonRequest(string? Name, string? Goal, int? WeeklyTarget);
public record CloseSeasonRequest(string? Outcome);

public record SeasonDto(
    Guid Id,
    Guid UserId,
    string Name,
    string? Goal,
    int WeeklyTarget,
    string Status,
    DateTime StartDate,
    DateTime? EndDate,
    string? Outcome,
    int? FinalApplicationCount,
    double? FinalResponseRate,
    int? FinalInterviewCount,
    int? FinalOfferCount,
    int? FinalStreakDays
);
