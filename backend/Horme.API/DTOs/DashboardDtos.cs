namespace Horme.API.DTOs;

public record DashboardDto(
    SeasonDto Season,
    StatsDto Stats,
    List<FunnelStageDto> Funnel,
    InsightDto? TopInsight,
    List<HeatmapDayDto> Heatmap,
    List<MilestoneStatusDto> Milestones
);

public record StatsDto(
    int TotalApplications,
    double ResponseRate,
    int CurrentStreak,
    int LongestStreak,
    int WeeklyProgress,
    int WeeklyTarget,
    PersonalBestsDto PersonalBests
);

public record PersonalBestsDto(int BestWeekApplications, int LongestStreak);

public record FunnelStageDto(string Stage, int Count, double? ConversionRate);

public record InsightDto(string Type, string Message, int Priority);

public record HeatmapDayDto(string Date, bool Active);

public record MilestoneDto(Guid Id, string Slug, string Name, string Description);
public record MilestoneStatusDto(MilestoneDto Milestone, string? UnlockedAt);
