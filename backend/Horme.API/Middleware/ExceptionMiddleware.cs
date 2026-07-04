using System.Net;
using System.Text.Json;
using Horme.API.Exceptions;

namespace Horme.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        var (status, message) = ex switch
        {
            NotFoundException => (HttpStatusCode.NotFound, ex.Message),
            BadRequestException => (HttpStatusCode.BadRequest, ex.Message),
            UnauthorizedException => (HttpStatusCode.Unauthorized, ex.Message),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };
        context.Response.StatusCode = (int)status;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = message }));
    }
}
