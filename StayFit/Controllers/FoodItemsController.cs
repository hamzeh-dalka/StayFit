using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.FoodItems;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Route("api/food-items")]
    [ApiController]
    public class FoodItemsController : ControllerBase
    {
        private readonly StayFitDbContext _dbContext;

        public FoodItemsController(StayFitDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllFoodItems([FromQuery] FilterFoodItems filter, CancellationToken ct)
        {
            var query = _dbContext.FoodItems.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Name))
            {
                query = query.Where(f => f.Name.Contains(filter.Name));
            }

            var foodItems = await query
                .OrderBy(f => f.Name)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(f => new FoodItemDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    CaloriesPer100g = f.CaloriesPer100g,
                    ProteinPer100g = f.ProteinPer100g,
                    CarbsPer100g = f.CarbsPer100g,
                    FatPer100g = f.FatPer100g
                })
                .ToListAsync(ct);

            return Ok(foodItems);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodItem(long id, CancellationToken ct)
        {
            var foodItem = await _dbContext.FoodItems
                .Where(f => f.Id == id)
                .Select(f => new FoodItemDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    CaloriesPer100g = f.CaloriesPer100g,
                    ProteinPer100g = f.ProteinPer100g,
                    CarbsPer100g = f.CarbsPer100g,
                    FatPer100g = f.FatPer100g
                })
                .FirstOrDefaultAsync(ct);

            if (foodItem == null)
            {
                return NotFound();
            }

            return Ok(foodItem);
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPost]
        public async Task<IActionResult> CreateFoodItem([FromBody] SaveFoodItemDto dto, CancellationToken ct)
        {
            var foodItem = new FoodItem
            {
                Name = dto.Name.Trim(),
                CaloriesPer100g = dto.CaloriesPer100g,
                ProteinPer100g = dto.ProteinPer100g,
                CarbsPer100g = dto.CarbsPer100g,
                FatPer100g = dto.FatPer100g
            };

            _dbContext.FoodItems.Add(foodItem);
            await _dbContext.SaveChangesAsync(ct);

            return Ok(new FoodItemDto
            {
                Id = foodItem.Id,
                Name = foodItem.Name,
                CaloriesPer100g = foodItem.CaloriesPer100g,
                ProteinPer100g = foodItem.ProteinPer100g,
                CarbsPer100g = foodItem.CarbsPer100g,
                FatPer100g = foodItem.FatPer100g
            });
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFoodItem(long id, [FromBody] SaveFoodItemDto dto, CancellationToken ct)
        {
            var foodItem = await _dbContext.FoodItems.FirstOrDefaultAsync(f => f.Id == id, ct);

            if (foodItem == null)
            {
                return NotFound();
            }

            foodItem.Name = dto.Name.Trim();
            foodItem.CaloriesPer100g = dto.CaloriesPer100g;
            foodItem.ProteinPer100g = dto.ProteinPer100g;
            foodItem.CarbsPer100g = dto.CarbsPer100g;
            foodItem.FatPer100g = dto.FatPer100g;

            await _dbContext.SaveChangesAsync(ct);

            return Ok(new FoodItemDto
            {
                Id = foodItem.Id,
                Name = foodItem.Name,
                CaloriesPer100g = foodItem.CaloriesPer100g,
                ProteinPer100g = foodItem.ProteinPer100g,
                CarbsPer100g = foodItem.CarbsPer100g,
                FatPer100g = foodItem.FatPer100g
            });
        }

        [Authorize(Roles = "Admin,SuperAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoodItem(long id, CancellationToken ct)
        {
            var foodItem = await _dbContext.FoodItems.FirstOrDefaultAsync(f => f.Id == id, ct);

            if (foodItem == null)
            {
                return NotFound();
            }

            var isUsed = await _dbContext.MealItems.AnyAsync(mi => mi.FoodItemId == id, ct)
                || await _dbContext.PlanMealItems.AnyAsync(pmi => pmi.FoodItemId == id, ct);

            if (isUsed)
            {
                return BadRequest("Cannot delete this food item because it's used in existing meals or nutrition plans.");
            }

            _dbContext.FoodItems.Remove(foodItem);
            await _dbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}