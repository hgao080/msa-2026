using Microsoft.AspNetCore.Mvc;
using Horme.API.DTOs;
using Horme.API.Services;

namespace Horme.API.Controllers;

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

    [HttpPost("applications/{id:guid}/offer")]
    public async Task<IActionResult> Offer(Guid id)
    {
        var app = await applicationService.OfferAsync(id, GetUserId());

        return Ok(app);
    }

    [HttpDelete("applications/{id:guid}/offer")]
    public async Task<IActionResult> Unoffer(Guid id)
    {
        var app = await applicationService.UnofferAsync(id, GetUserId());

        return Ok(app);
    }

    [HttpPost("applications/{id:guid}/withdraw")]
    public async Task<IActionResult> Withdraw(Guid id)
    {
        var app = await applicationService.WithdrawAsync(id, GetUserId());

        return Ok(app);
    }

    [HttpDelete("applications/{id:guid}/withdraw")]
    public async Task<IActionResult> Unwithdraw(Guid id)
    {
        var app = await applicationService.UnwithdrawAsync(id, GetUserId());

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

    [HttpDelete("applications/{id:guid}/stages/{stageId:guid}")]
    public async Task<IActionResult> DeleteStage(Guid id, Guid stageId)
    {
        await applicationService.DeleteStageAsync(id, GetUserId(), stageId);

        return NoContent();
    }
}
