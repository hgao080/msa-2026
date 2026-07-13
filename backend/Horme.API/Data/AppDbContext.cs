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

        modelBuilder.Entity<Milestone>().HasData(MilestoneSeedData.All);
    }
}
