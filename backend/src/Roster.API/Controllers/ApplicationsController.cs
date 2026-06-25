using Microsoft.AspNetCore.Mvc;
using Roster.API.DTOs;
using Roster.API.Services;
using System.Security.Claims;

namespace Roster.API.Controllers;

[ApiController]
public class ApplicationsController : ControllerBase
{
    private readonly ApplicationService _applicationService;

    public ApplicationsController(ApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("api/seasons/{seasonId:guid}/applications")]
    public async Task<IActionResult> GetApplications(Guid seasonId,
        [FromQuery] string? status, [FromQuery] string? source,
        [FromQuery] string? sort, [FromQuery] string? order)
    {
        var apps = await _applicationService.GetApplicationsAsync(seasonId, GetUserId(), status, source, sort, order);
        return Ok(apps);
    }

    [HttpPost("api/seasons/{seasonId:guid}/applications")]
    public async Task<IActionResult> CreateApplication(Guid seasonId, [FromBody] CreateApplicationRequest request)
    {
        var app = await _applicationService.CreateApplicationAsync(seasonId, GetUserId(), request);
        return Ok(app);
    }

    [HttpGet("api/applications/{id:guid}")]
    public async Task<IActionResult> GetApplication(Guid id)
    {
        var app = await _applicationService.GetApplicationAsync(id, GetUserId());
        return Ok(app);
    }

    [HttpPut("api/applications/{id:guid}")]
    public async Task<IActionResult> UpdateApplication(Guid id, [FromBody] UpdateApplicationRequest request)
    {
        var app = await _applicationService.UpdateApplicationAsync(id, GetUserId(), request);
        return Ok(app);
    }

    [HttpDelete("api/applications/{id:guid}")]
    public async Task<IActionResult> DeleteApplication(Guid id)
    {
        await _applicationService.DeleteApplicationAsync(id, GetUserId());
        return NoContent();
    }

    [HttpPatch("api/applications/{id:guid}/status")]
    public async Task<IActionResult> PatchStatus(Guid id, [FromBody] PatchStatusRequest request)
    {
        var app = await _applicationService.PatchStatusAsync(id, GetUserId(), request.Status);
        return Ok(app);
    }

    [HttpPost("api/applications/{id:guid}/stages")]
    public async Task<IActionResult> AddStage(Guid id, [FromBody] CreateStageRequest request)
    {
        var stage = await _applicationService.AddStageAsync(id, GetUserId(), request);
        return Ok(stage);
    }

    [HttpPut("api/applications/{id:guid}/stages/{stageId:guid}")]
    public async Task<IActionResult> UpdateStage(Guid id, Guid stageId, [FromBody] UpdateStageRequest request)
    {
        var stage = await _applicationService.UpdateStageAsync(id, GetUserId(), stageId, request);
        return Ok(stage);
    }
}
