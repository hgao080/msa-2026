using Microsoft.AspNetCore.Mvc;
using Roster.API.DTOs;
using Roster.API.Services;

namespace Roster.API.Controllers;

[ApiController]
[Route("api/seasons")]
public class SeasonsController(SeasonService seasonService) : AppControllerBase
{
[HttpGet]
    public async Task<IActionResult> GetSeasons()
    {
        var seasons = await seasonService.GetSeasonsAsync(GetUserId());
        
        return Ok(seasons);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSeason([FromBody] CreateSeasonRequest request)
    {
        var season = await seasonService.CreateSeasonAsync(request, GetUserId());
        
        return Ok(season);
        
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSeason(Guid id)
    {
        var season = await seasonService.GetSeasonAsync(id, GetUserId());
        
        return Ok(season);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSeason(Guid id, [FromBody] UpdateSeasonRequest request)
    {
        var season = await seasonService.UpdateSeasonAsync(id, GetUserId(), request);
        
        return Ok(season);
    }

    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> CloseSeason(Guid id, [FromBody] CloseSeasonRequest request)
    {
        var season = await seasonService.CloseSeasonAsync(id, GetUserId(), request.Outcome);
        
        return Ok(season);
    }
}
