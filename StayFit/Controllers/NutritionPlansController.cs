using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.NutritionPlans;
using StayFit.Enums;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Authorize(Roles = "Coach,Client")]
    [Route("api/nutrition-plans")]
    [ApiController]
    public class NutritionPlansController : BaseApiController
    {
        public NutritionPlansController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNutritionPlans(CancellationToken ct)
        {
            var role = GetCurrentUserRole();
            var query = DbContext.NutritionPlans
                .Include(np => np.CoachProfile).ThenInclude(cp => cp.User)
                .Include(np => np.ClientProfile).ThenInclude(cp => cp.User)
                .AsQueryable();

            if (role == Role.Coach)
            {
                var coachProfile = await GetCurrentCoachProfileAsync(ct);
                if (coachProfile == null) return NotFound("Coach profile not found.");
                query = query.Where(np => np.CoachProfileId == coachProfile.Id);
            }
            else
            {
                var clientProfile = await GetCurrentClientProfileAsync(ct);
                if (clientProfile == null) return NotFound("Client profile not found.");
                query = query.Where(np => np.ClientProfileId == clientProfile.Id);
            }

            var plans = await query
                .OrderByDescending(np => np.CreatedAt)
                .Select(np => new NutritionPlanDto
                {
                    Id = np.Id,
                    Title = np.Title,
                    CreatedAt = np.CreatedAt,
                    CoachName = np.CoachProfile.User.Name,
                    ClientName = np.ClientProfile.User.Name
                })
                .ToListAsync(ct);

            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNutritionPlan(long id, CancellationToken ct)
        {
            var plan = await DbContext.NutritionPlans
                .Include(np => np.CoachProfile).ThenInclude(cp => cp.User)
                .Include(np => np.ClientProfile).ThenInclude(cp => cp.User)
                .FirstOrDefaultAsync(np => np.Id == id, ct);

            if (plan == null)
            {
                return NotFound();
            }

            var userId = GetCurrentUserId();
            var isOwnerCoach = plan.CoachProfile.UserId == userId;
            var isBeneficiaryClient = plan.ClientProfile.UserId == userId;

            if (!isOwnerCoach && !isBeneficiaryClient)
            {
                return Forbid();
            }

            var items = await DbContext.PlanMealItems
                .Include(pmi => pmi.FoodItem)
                .Where(pmi => pmi.NutritionPlanId == id)
                .Select(pmi => new PlanMealItemDto
                {
                    Id = pmi.Id,
                    FoodItemId = pmi.FoodItemId,
                    FoodItemName = pmi.FoodItem.Name,
                    QuantityGrams = pmi.QuantityGrams,
                    DayOfWeek = pmi.DayOfWeek
                })
                .ToListAsync(ct);

            return Ok(new NutritionPlanDetailDto
            {
                Id = plan.Id,
                Title = plan.Title,
                CreatedAt = plan.CreatedAt,
                CoachName = plan.CoachProfile.User.Name,
                ClientName = plan.ClientProfile.User.Name,
                Items = items
            });
        }

        [Authorize(Roles = "Coach")]
        [HttpPost]
        public async Task<IActionResult> CreateNutritionPlan([FromBody] SaveNutritionPlanDto dto, CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var isLinked = await IsCoachLinkedToClientAsync(coachProfile.Id, dto.ClientProfileId, ct);
            if (!isLinked)
            {
                return BadRequest("You are not linked to this client.");
            }

            var plan = new NutritionPlan
            {
                CoachProfileId = coachProfile.Id,
                ClientProfileId = dto.ClientProfileId,
                Title = dto.Title.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            DbContext.NutritionPlans.Add(plan);
            await DbContext.SaveChangesAsync(ct);

            return Ok(new NutritionPlanDto
            {
                Id = plan.Id,
                Title = plan.Title,
                CreatedAt = plan.CreatedAt
            });
        }

        [Authorize(Roles = "Coach")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNutritionPlan(long id, [FromBody] SaveNutritionPlanDto dto, CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var plan = await DbContext.NutritionPlans.FirstOrDefaultAsync(np => np.Id == id, ct);

            if (plan == null)
            {
                return NotFound();
            }

            if (plan.CoachProfileId != coachProfile.Id)
            {
                return Forbid();
            }

            plan.Title = dto.Title.Trim();

            await DbContext.SaveChangesAsync(ct);

            return Ok(new NutritionPlanDto
            {
                Id = plan.Id,
                Title = plan.Title,
                CreatedAt = plan.CreatedAt
            });
        }

        [Authorize(Roles = "Coach")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNutritionPlan(long id, CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var plan = await DbContext.NutritionPlans.FirstOrDefaultAsync(np => np.Id == id, ct);

            if (plan == null)
            {
                return NotFound();
            }

            if (plan.CoachProfileId != coachProfile.Id)
            {
                return Forbid();
            }

            DbContext.NutritionPlans.Remove(plan);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Coach")]
        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddPlanMealItem(long id, [FromBody] AddPlanMealItemDto dto, CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var plan = await DbContext.NutritionPlans.FirstOrDefaultAsync(np => np.Id == id, ct);

            if (plan == null)
            {
                return NotFound("Nutrition plan not found.");
            }

            if (plan.CoachProfileId != coachProfile.Id)
            {
                return Forbid();
            }

            var foodItemExists = await DbContext.FoodItems.AnyAsync(f => f.Id == dto.FoodItemId, ct);
            if (!foodItemExists)
            {
                return NotFound("Food item not found.");
            }

            var planMealItem = new PlanMealItem
            {
                NutritionPlanId = id,
                FoodItemId = dto.FoodItemId,
                QuantityGrams = dto.QuantityGrams,
                DayOfWeek = dto.DayOfWeek
            };

            DbContext.PlanMealItems.Add(planMealItem);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}