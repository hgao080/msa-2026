using Microsoft.AspNetCore.Mvc;
using Roster.API.DTOs;
using Roster.API.Services;

namespace Roster.API.Controllers;

[ApiController]
[Route("api")]
public class ApplicationsController(ApplicationService applicationService) : AppControllerBase
{
[HttpGet("seasons/{seasonId:guid}/applications")]
    public async Task<IActionResult> GetApplications(Guid seasonId,
        [FromQuery] string? status, [FromQuery] string? source,
        [FromQuery] string? sort, [FromQuery] string? order)
    {
        var apps = await applicationService.GetApplicationsAsync(seasonId, GetUserId(), status, source, sort, order);
        
        return Ok(apps);
    }

    [HttpPost("seasons/{seasonId:guid}/applications")]
    public async Task<IActionResult> CreateApplication(Guid seasonId, [FromBody] CreateApplicationRequest request)
    {
        var app = await applicationService.CreateApplicationAsync(seasonId, GetUserId(), request);
        
        return Ok(app);
    }

    [HttpGet("applications/{id:guid}")]
    public async Task<IActionResult> GetApplication(Guid id)
    {
        var app = await applicationService.GetApplicationAsync(id, GetUserId());
        
        return Ok(app);
    }

    [HttpPut("applications/{id:guid}")]
    public async Task<IActionResult> UpdateApplication(Guid id, [FromBody] UpdateApplicationRequest request)
    {
        var app = await applicationService.UpdateApplicationAsync(id, GetUserId(), request);
        
        return Ok(app);
    }

    [HttpDelete("applications/{id:guid}")]
    public async Task<IActionResult> DeleteApplication(Guid id)
    {
        await applicationService.DeleteApplicationAsync(id, GetUserId());
        
        return NoContent();
    }

    [HttpPatch("applications/{id:guid}/status")]
    public async Task<IActionResult> PatchStatus(Guid id, [FromBody] PatchStatusRequest request)
    {
        var app = await applicationService.PatchStatusAsync(id, GetUserId(), request.Status);
        
        return Ok(app);
    }

    [HttpPost("applications/{id:guid}/stages")]
    public async Task<IActionResult> AddStage(Guid id, [FromBody] CreateStageRequest request)
    {
        var stage = await applicationService.AddStageAsync(id, GetUserId(), request);
        
        return Ok(stage);
    }

    [HttpPut("applications/{id:guid}/stages/{stageId:guid}")]
    public async Task<IActionResult> UpdateStage(Guid id, Guid stageId, [FromBody] UpdateStageRequest request)
    {
        var stage = await applicationService.UpdateStageAsync(id, GetUserId(), stageId, request);
        
        return Ok(stage);
    }
}
