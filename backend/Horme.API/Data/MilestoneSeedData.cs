using Horme.API.Models;

namespace Horme.API.Data;

public static class MilestoneSeedData
{
    public static readonly Milestone[] All =
    [
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111001"), Slug = "first-application", Name = "First Application Sent", Description = "Sent your first application" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111002"), Slug = "ten-applications", Name = "10 Applications", Description = "Sent 10 applications" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111003"), Slug = "twenty-five-applications", Name = "25 Applications", Description = "Sent 25 applications" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111004"), Slug = "first-response", Name = "First Response", Description = "Received your first response" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111005"), Slug = "first-interview", Name = "First Interview Booked", Description = "Booked your first interview" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111006"), Slug = "five-interviews", Name = "5 Interviews Completed", Description = "Completed 5 interview stages" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111007"), Slug = "first-offer", Name = "First Offer", Description = "Received your first job offer" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111008"), Slug = "streak-7", Name = "7-Day Streak", Description = "Logged activity for 7 days straight" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111009"), Slug = "streak-14", Name = "14-Day Streak", Description = "Logged activity for 14 days straight" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111010"), Slug = "streak-30", Name = "30-Day Streak", Description = "Logged activity for 30 days straight" },
        new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111011"), Slug = "weekly-target", Name = "Weekly Target Hit", Description = "Hit your weekly application target" }
    ];
}
