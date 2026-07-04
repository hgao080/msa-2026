using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.DTOs;

namespace Roster.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await db.Users.CountAsync();
        var totalSeasons = await db.Seasons.CountAsync();
        var totalApplications = await db.Applications.CountAsync();
        var avgApps = totalSeasons > 0 ? (double)totalApplications / totalSeasons : 0;

        return Ok(new AdminStatsDto(
            totalUsers,
            totalSeasons,
            totalApplications,
            avgApps));
    }
}
