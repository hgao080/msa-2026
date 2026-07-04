using Microsoft.AspNetCore.Mvc;
using Roster.API.DTOs;
using Roster.API.Services;

namespace Roster.API.Controllers;

[ApiController]
[Route("api/seasons/{seasonId:guid}")]
public class DashboardController(DashboardService dashboardService, InsightService insightService)
    : AppControllerBase
{
[HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(Guid seasonId)
    {
        var userId = GetUserId();
        var dashboard = await dashboardService.GetDashboardAsync(seasonId, userId);
        var insights = await insightService.GetInsightsAsync(userId, seasonId);
        var topInsight = insights.FirstOrDefault();
        var result = dashboard with { TopInsight = topInsight };
        
        return Ok(result);
    }

    [HttpGet("insights")]
    public async Task<IActionResult> GetInsights(Guid seasonId)
    {
        var insights = await insightService.GetInsightsAsync(GetUserId(), seasonId);
        
        return Ok(insights);
    }
}
