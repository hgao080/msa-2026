using Microsoft.EntityFrameworkCore;
using Horme.API.Models;

namespace Horme.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Season> Seasons => Set<Season>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationStage> ApplicationStages => Set<ApplicationStage>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<UserMilestone> UserMilestones => Set<UserMilestone>();
    public DbSet<DailyActivity> DailyActivities => Set<DailyActivity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserMilestone>()
            .HasKey(um => new { um.UserId, um.MilestoneId, um.SeasonId });

        modelBuilder.Entity<DailyActivity>()
            .HasKey(da => new { da.UserId, da.Date });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.Email).HasMaxLength(255);
            entity.Property(u => u.Username).HasMaxLength(50);
            entity.Property(u => u.PasswordHash).HasMaxLength(60);
        });

        modelBuilder.Entity<Season>(entity =>
        {
            entity.Property(s => s.Name).HasMaxLength(100);
            entity.Property(s => s.Goal).HasMaxLength(500);
            entity.Property(s => s.Outcome).HasMaxLength(200);
        });

        modelBuilder.Entity<Application>(entity =>
        {
            entity.Property(a => a.Company).HasMaxLength(200);
            entity.Property(a => a.Role).HasMaxLength(200);
            entity.Property(a => a.JobPostingUrl).HasMaxLength(2048);
            entity.Property(a => a.ReferrerName).HasMaxLength(100);
            entity.Property(a => a.Notes).HasMaxLength(2000);
        });

        modelBuilder.Entity<ApplicationStage>()
            .Property(s => s.Notes).HasMaxLength(2000);

        modelBuilder.Entity<Milestone>(entity =>
        {
            entity.Property(m => m.Slug).HasMaxLength(50);
            entity.Property(m => m.Name).HasMaxLength(100);
            entity.Property(m => m.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<Milestone>().HasData(
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111001"), Slug = "first-application", Name = "First Application Sent", Description = "Sent your first application" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111002"), Slug = "ten-applications", Name = "10 Applications", Description = "Sent 10 applications" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111003"), Slug = "twenty-five-applications", Name = "25 Applications", Description = "Sent 25 applications" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111004"), Slug = "first-response", Name = "First Response", Description = "Received your first response" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111005"), Slug = "first-interview", Name = "First Interview Booked", Description = "Booked your first interview" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111006"), Slug = "five-interviews", Name = "5 Interviews Completed", Description = "Completed 5 interview stages" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111007"), Slug = "first-offer", Name = "First Offer", Description = "Received your first job offer" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111008"), Slug = "streak-7", Name = "7-Day Streak", Description = "Logged activity for 7 days straight" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111009"), Slug = "streak-14", Name = "14-Day Streak", Description = "Logged activity for 14 days straight" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111010"), Slug = "streak-30", Name = "30-Day Streak", Description = "Logged activity for 30 days straight" },
            new Milestone { Id = Guid.Parse("11111111-1111-1111-1111-111111111011"), Slug = "weekly-target", Name = "Weekly Target Hit", Description = "Hit your weekly application target" }
        );
    }
}
