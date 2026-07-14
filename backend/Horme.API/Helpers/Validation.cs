using Horme.API.Exceptions;

namespace Horme.API.Helpers;

public static class Validation
{
    public static void EnsureMaxLength(string? value, int maxLength, string fieldName)
    {
        if (value != null && value.Length > maxLength)
            throw new BadRequestException($"{fieldName} must be {maxLength} characters or fewer");
    }
}
