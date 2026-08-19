using Microsoft.EntityFrameworkCore;
using StayFit.Enums;
using StayFit.Models;

namespace StayFit
{
    public class StayFitDbContext : DbContext
    {
        public StayFitDbContext(DbContextOptions<StayFitDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "SuperAdmin",
                    Email = "superadmin@stayfit.com",
                    HashedPassword = "$2a$11$Mzk70htfh0FoBhAjRmOyCut9KEwac/aFMYjmZxEA77grz3pZRbIBW", //SuperAdmin123
                    Role = Role.SuperAdmin,
                    CreatedAt = new DateTime(2026, 8, 15)
                });

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CoachClient>()
                .HasOne(cc => cc.ClientProfile)
                .WithMany()
                .HasForeignKey(cc => cc.ClientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CoachClient>()
                .HasOne(cc => cc.CoachProfile)
                .WithMany()
                .HasForeignKey(cc => cc.CoachProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NutritionPlan>()
                .HasOne(np => np.ClientProfile)
                .WithMany()
                .HasForeignKey(np => np.ClientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NutritionPlan>()
                .HasOne(np => np.CoachProfile)
                .WithMany()
                .HasForeignKey(np => np.CoachProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WorkoutPlan>()
                .HasOne(wp => wp.ClientProfile)
                .WithMany()
                .HasForeignKey(wp => wp.ClientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WorkoutPlan>()
                .HasOne(wp => wp.CoachProfile)
                .WithMany()
                .HasForeignKey(wp => wp.CoachProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Meal>()
                .HasOne(m => m.ClientProfile)
                .WithMany()
                .HasForeignKey(m => m.ClientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WorkoutLog>()
                .HasOne(wl => wl.ClientProfile)
                .WithMany()
                .HasForeignKey(wl => wl.ClientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WeightLog>()
                .HasOne(wl => wl.ClientProfile)
                .WithMany()
                .HasForeignKey(wl => wl.ClientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Goal>()
                .HasOne(g => g.ClientProfile)
                .WithMany()
                .HasForeignKey(g => g.ClientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MealItem>()
                .HasOne(mi => mi.FoodItem)
                .WithMany()
                .HasForeignKey(mi => mi.FoodItemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PlanMealItem>()
                .HasOne(pmi => pmi.FoodItem)
                .WithMany()
                .HasForeignKey(pmi => pmi.FoodItemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WorkoutLogItem>()
                .HasOne(wli => wli.Exercise)
                .WithMany()
                .HasForeignKey(wli => wli.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PlanExerciseItem>()
                .HasOne(pei => pei.Exercise)
                .WithMany()
                .HasForeignKey(pei => pei.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ClientProfile> ClientProfiles { get; set; }
        public DbSet<CoachProfile> CoachProfiles { get; set; }
        public DbSet<WeightLog> WeightLogs { get; set; }
        public DbSet<WorkoutLog> WorkoutLogs { get; set; }
        public DbSet<WorkoutLogItem> WorkoutLogItems { get; set; }
        public DbSet<WorkoutPlan> WorkoutPlans { get; set; }
        public DbSet<PlanExerciseItem> PlanExerciseItems { get; set; }
        public DbSet<NutritionPlan> NutritionPlans { get; set; }
        public DbSet<PlanMealItem> PlanMealItems { get; set; }
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<FoodItem> FoodItems { get; set; }
        public DbSet<Meal> Meals { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<CoachClient> CoachClients { get; set; }
        public DbSet<MealItem> MealItems { get; set; }

    }
}
