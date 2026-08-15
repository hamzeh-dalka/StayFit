using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.Meals;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Authorize]
    [Route("api/meals")]
    [ApiController]
    public class MealsController : BaseApiController
    {
        public MealsController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [Authorize(Roles = "Client")]
        [HttpGet]
        public async Task<IActionResult> GetMyMeals([FromQuery] FilterMeals filter, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var query = DbContext.Meals.Where(m => m.ClientProfileId == clientProfile.Id);

            if (filter.FromDate.HasValue)
            {
                query = query.Where(m => m.LoggedAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(m => m.LoggedAt <= filter.ToDate.Value);
            }

            var meals = await query
                .OrderByDescending(m => m.LoggedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(m => new MealDto
                {
                    Id = m.Id,
                    MealType = m.MealType,
                    LoggedAt = m.LoggedAt
                })
                .ToListAsync(ct);

            return Ok(meals);
        }

        [Authorize(Roles = "Client,Coach")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMeal(long id, CancellationToken ct)
        {
            var meal = await DbContext.Meals
                .Include(m => m.ClientProfile)
                .FirstOrDefaultAsync(m => m.Id == id, ct);

            if (meal == null)
            {
                return NotFound();
            }

            var canAccess = await CanAccessClientDataAsync(meal.ClientProfileId, ct);
            if (!canAccess)
            {
                return Forbid();
            }

            var items = await DbContext.MealItems
                .Include(mi => mi.FoodItem)
                .Where(mi => mi.MealId == id)
                .Select(mi => new MealItemDto
                {
                    Id = mi.Id,
                    FoodItemId = mi.FoodItemId,
                    FoodItemName = mi.FoodItem.Name,
                    QuantityInGrams = mi.QuantityInGrams,
                    CaloriesPer100g = mi.FoodItem.CaloriesPer100g
                })
                .ToListAsync(ct);

            return Ok(new MealDetailDto
            {
                Id = meal.Id,
                MealType = meal.MealType,
                LoggedAt = meal.LoggedAt,
                Items = items
            });
        }

        [Authorize(Roles = "Client")]
        [HttpPost]
        public async Task<IActionResult> CreateMeal([FromBody] SaveMealDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var meal = new Meal
            {
                ClientProfileId = clientProfile.Id,
                MealType = dto.MealType,
                LoggedAt = dto.LoggedAt
            };

            DbContext.Meals.Add(meal);
            await DbContext.SaveChangesAsync(ct);

            return Ok(new MealDto
            {
                Id = meal.Id,
                MealType = meal.MealType,
                LoggedAt = meal.LoggedAt
            });
        }

        [Authorize(Roles = "Client")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMeal(long id, [FromBody] SaveMealDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var meal = await DbContext.Meals.FirstOrDefaultAsync(m => m.Id == id, ct);

            if (meal == null)
            {
                return NotFound();
            }

            if (meal.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            meal.MealType = dto.MealType;
            meal.LoggedAt = dto.LoggedAt;

            await DbContext.SaveChangesAsync(ct);

            return Ok(new MealDto
            {
                Id = meal.Id,
                MealType = meal.MealType,
                LoggedAt = meal.LoggedAt
            });
        }

        [Authorize(Roles = "Client")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMeal(long id, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var meal = await DbContext.Meals.FirstOrDefaultAsync(m => m.Id == id, ct);

            if (meal == null)
            {
                return NotFound();
            }

            if (meal.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            DbContext.Meals.Remove(meal);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Client")]
        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddMealItem(long id, [FromBody] AddMealItemDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var meal = await DbContext.Meals.FirstOrDefaultAsync(m => m.Id == id, ct);

            if (meal == null)
            {
                return NotFound("Meal not found.");
            }

            if (meal.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            var foodItemExists = await DbContext.FoodItems.AnyAsync(f => f.Id == dto.FoodItemId, ct);
            if (!foodItemExists)
            {
                return NotFound("Food item not found.");
            }

            var mealItem = new MealItem
            {
                MealId = id,
                FoodItemId = dto.FoodItemId,
                QuantityInGrams = dto.QuantityInGrams
            };

            DbContext.MealItems.Add(mealItem);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Client")]
        [HttpDelete("{id}/items/{itemId}")]
        public async Task<IActionResult> DeleteMealItem(long id, long itemId, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var meal = await DbContext.Meals.FirstOrDefaultAsync(m => m.Id == id, ct);

            if (meal == null)
            {
                return NotFound("Meal not found.");
            }

            if (meal.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            var mealItem = await DbContext.MealItems
                .FirstOrDefaultAsync(mi => mi.Id == itemId && mi.MealId == id, ct);

            if (mealItem == null)
            {
                return NotFound("Meal item not found.");
            }

            DbContext.MealItems.Remove(mealItem);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}