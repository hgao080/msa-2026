using Microsoft.AspNetCore.Mvc;
using Roster.API.DTOs;
using Roster.API.Services;
using System.Security.Claims;

namespace Roster.API.Controllers;

[ApiController]
[Route("api/seasons")]
public class SeasonsController : ControllerBase
{
    private readonly SeasonService _seasonService;

    public SeasonsController(SeasonService seasonService)
    {
        _seasonService = seasonService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetSeasons()
    {
        var seasons = await _seasonService.GetSeasonsAsync(GetUserId());
        return Ok(seasons);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSeason([FromBody] CreateSeasonRequest request)
    {
        var season = await _seasonService.CreateSeasonAsync(request, GetUserId());
        return Ok(season);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSeason(Guid id)
    {
        var season = await _seasonService.GetSeasonAsync(id, GetUserId());
        return Ok(season);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSeason(Guid id, [FromBody] UpdateSeasonRequest request)
    {
        var season = await _seasonService.UpdateSeasonAsync(id, GetUserId(), request);
        return Ok(season);
    }

    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> CloseSeason(Guid id, [FromBody] CloseSeasonRequest request)
    {
        var season = await _seasonService.CloseSeasonAsync(id, GetUserId(), request.Outcome);
        return Ok(season);
    }
}
