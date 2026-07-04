using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Horme.API.Controllers;

public abstract class AppControllerBase : ControllerBase
{
    protected Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
