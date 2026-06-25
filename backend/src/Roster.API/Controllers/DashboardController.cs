using Microsoft.AspNetCore.Mvc;
using Roster.API.DTOs;
using Roster.API.Services;
using System.Security.Claims;

namespace Roster.API.Controllers;

[ApiController]
[Route("api/seasons/{seasonId:guid}")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    private readonly InsightService _insightService;

    public DashboardController(DashboardService dashboardService, InsightService insightService)
    {
        _dashboardService = dashboardService;
        _insightService = insightService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(Guid seasonId)
    {
        var userId = GetUserId();
        var dashboard = await _dashboardService.GetDashboardAsync(seasonId, userId);
        var insights = await _insightService.GetInsightsAsync(userId, seasonId);
        var topInsight = insights.FirstOrDefault();
        var result = dashboard with { TopInsight = topInsight };
        return Ok(result);
    }

    [HttpGet("insights")]
    public async Task<IActionResult> GetInsights(Guid seasonId)
    {
        var insights = await _insightService.GetInsightsAsync(GetUserId(), seasonId);
        return Ok(insights);
    }
}
