using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Horme.API.Data;
using Horme.API.DTOs;
using Horme.API.Exceptions;
using Horme.API.Services;

namespace Horme.Tests.Services;

public class AuthServiceTests
{
    private AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private IConfiguration CreateConfig() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-secret-key-that-is-long-enough-32chars",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience",
                ["Jwt:ExpiryMinutes"] = "60"
            })
            .Build();

    [Fact]
    public async Task Register_NewUser_ReturnsToken()
    {
        using var db = CreateDb();
        var service = new AuthService(db, CreateConfig());
        var result = await service.RegisterAsync(new RegisterRequest("test@example.com", "testuser", "password123"));
        Assert.NotEmpty(result.Token);
        Assert.Equal("test@example.com", result.User.Email);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ThrowsBadRequest()
    {
        using var db = CreateDb();
        var service = new AuthService(db, CreateConfig());
        await service.RegisterAsync(new RegisterRequest("dup@example.com", "user1", "password"));
        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.RegisterAsync(new RegisterRequest("dup@example.com", "user2", "password")));
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        using var db = CreateDb();
        var service = new AuthService(db, CreateConfig());
        await service.RegisterAsync(new RegisterRequest("login@example.com", "loginuser", "mypassword"));
        var result = await service.LoginAsync(new LoginRequest("login@example.com", "mypassword"));
        Assert.NotEmpty(result.Token);
    }

    [Fact]
    public async Task Login_InvalidPassword_ThrowsUnauthorized()
    {
        using var db = CreateDb();
        var service = new AuthService(db, CreateConfig());
        await service.RegisterAsync(new RegisterRequest("auth@example.com", "authuser", "correctpassword"));
        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            service.LoginAsync(new LoginRequest("auth@example.com", "wrongpassword")));
    }
}
