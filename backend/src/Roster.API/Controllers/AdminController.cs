using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Roster.API.Data;
using Roster.API.DTOs;

namespace Roster.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalSeasons = await _db.Seasons.CountAsync();
        var totalApplications = await _db.Applications.CountAsync();
        var avgApps = totalSeasons > 0 ? (double)totalApplications / totalSeasons : 0;

        return Ok(new AdminStatsDto(totalUsers, totalSeasons, totalApplications, avgApps));
    }
}
