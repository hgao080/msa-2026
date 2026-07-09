namespace Horme.API.DTOs;

public record RegisterRequest(string Email, string Username, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, UserDto User);

public record UserDto(
    Guid Id,
    string Email,
    string Username
);
