using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.Dashboard;
using StayFit.Enums;

namespace StayFit.Controllers
{
    [Authorize]
    [Route("api/dashboard")]
    [ApiController]
    public class DashboardController : BaseApiController
    {
        public DashboardController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminDashboard(CancellationToken ct)
        {
            var dto = new AdminDashboardDto
            {
                TotalUsers = await DbContext.Users.CountAsync(ct),
                TotalCoaches = await DbContext.Users.CountAsync(u => u.Role == Role.Coach, ct),
                TotalClients = await DbContext.Users.CountAsync(u => u.Role == Role.Client, ct),
                TotalFoodItems = await DbContext.FoodItems.CountAsync(ct),
                TotalExercises = await DbContext.Exercises.CountAsync(ct)
            };

            return Ok(dto);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("system")]
        public async Task<IActionResult> GetSystemDashboard(CancellationToken ct)
        {
            var dto = new SystemDashboardDto
            {
                TotalMessages = await DbContext.Messages.CountAsync(ct),
                TotalNotifications = await DbContext.Notifications.CountAsync(ct),
                PendingCoachClientRequests = await DbContext.CoachClients
                    .CountAsync(cc => cc.Status == CoachClientStatus.Pending, ct),
                TotalNutritionPlans = await DbContext.NutritionPlans.CountAsync(ct),
                TotalWorkoutPlans = await DbContext.WorkoutPlans.CountAsync(ct),
                LastUserRegisteredAt = await DbContext.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Select(u => (DateTime?)u.CreatedAt)
                    .FirstOrDefaultAsync(ct)
            };

            return Ok(dto);
        }

        [Authorize(Roles = "Coach")]
        [HttpGet("coach")]
        public async Task<IActionResult> GetCoachDashboard(CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var dto = new CoachDashboardDto
            {
                TotalClients = await DbContext.CoachClients
                    .CountAsync(cc => cc.CoachProfileId == coachProfile.Id && cc.Status == CoachClientStatus.Accepted, ct),
                PendingRequests = await DbContext.CoachClients
                    .CountAsync(cc => cc.CoachProfileId == coachProfile.Id && cc.Status == CoachClientStatus.Pending, ct),
                ActiveNutritionPlans = await DbContext.NutritionPlans
                    .CountAsync(np => np.CoachProfileId == coachProfile.Id, ct),
                ActiveWorkoutPlans = await DbContext.WorkoutPlans
                    .CountAsync(wp => wp.CoachProfileId == coachProfile.Id, ct)
            };

            return Ok(dto);
        }

        [Authorize(Roles = "Client")]
        [HttpGet("client")]
        public async Task<IActionResult> GetClientDashboard(CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);

            var todayCalories = await DbContext.MealItems
                .Include(mi => mi.FoodItem)
                .Where(mi => mi.Meal.ClientProfileId == clientProfile.Id && mi.Meal.LoggedAt.Date == today)
                .SumAsync(mi => mi.QuantityInGrams / 100f * mi.FoodItem.CaloriesPer100g, ct);

            var latestWeight = await DbContext.WeightLogs
                .Where(w => w.ClientProfileId == clientProfile.Id)
                .OrderByDescending(w => w.RecordedAt)
                .Select(w => (float?)w.WeightKg)
                .FirstOrDefaultAsync(ct);

            var activeGoalsCount = await DbContext.Goals
                .CountAsync(g => g.ClientProfileId == clientProfile.Id && g.Deadline >= DateOnly.FromDateTime(today), ct);

            var workoutsThisWeek = await DbContext.WorkoutLogs
                .CountAsync(wl => wl.ClientProfileId == clientProfile.Id && wl.LoggedAt >= startOfWeek, ct);

            var dto = new ClientDashboardDto
            {
                TodayCalories = todayCalories,
                LatestWeightKg = latestWeight,
                ActiveGoalsCount = activeGoalsCount,
                WorkoutsThisWeek = workoutsThisWeek
            };

            return Ok(dto);
        }
    }
}