using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.Exercises;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Route("api/exercises")]
    [ApiController]
    public class ExercisesController : ControllerBase
    {
        private readonly StayFitDbContext _dbContext;

        public ExercisesController(StayFitDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllExercises([FromQuery] FilterExercises filter, CancellationToken ct)
        {
            var query = _dbContext.Exercises.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Name))
            {
                query = query.Where(e => e.ExerciseName.Contains(filter.Name));
            }

            if (!string.IsNullOrWhiteSpace(filter.MuscleGroup))
            {
                query = query.Where(e => e.MuscleGroup.Contains(filter.MuscleGroup));
            }

            var exercises = await query
                .OrderBy(e => e.ExerciseName)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(e => new ExerciseDto
                {
                    Id = e.Id,
                    ExerciseName = e.ExerciseName,
                    MuscleGroup = e.MuscleGroup,
                    CaloriesBurnedPerMinute = e.CaloriesBurnedPerMinute
                })
                .ToListAsync(ct);

            return Ok(exercises);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetExercise(long id, CancellationToken ct)
        {
            var exercise = await _dbContext.Exercises
                .Where(e => e.Id == id)
                .Select(e => new ExerciseDto
                {
                    Id = e.Id,
                    ExerciseName = e.ExerciseName,
                    MuscleGroup = e.MuscleGroup,
                    CaloriesBurnedPerMinute = e.CaloriesBurnedPerMinute
                })
                .FirstOrDefaultAsync(ct);

            if (exercise == null)
            {
                return NotFound();
            }

            return Ok(exercise);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateExercise([FromBody] SaveExerciseDto dto, CancellationToken ct)
        {
            var exercise = new Exercise
            {
                ExerciseName = dto.ExerciseName.Trim(),
                MuscleGroup = dto.MuscleGroup.Trim(),
                CaloriesBurnedPerMinute = dto.CaloriesBurnedPerMinute
            };

            _dbContext.Exercises.Add(exercise);
            await _dbContext.SaveChangesAsync(ct);

            return Ok(new ExerciseDto
            {
                Id = exercise.Id,
                ExerciseName = exercise.ExerciseName,
                MuscleGroup = exercise.MuscleGroup,
                CaloriesBurnedPerMinute = exercise.CaloriesBurnedPerMinute
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExercise(long id, [FromBody] SaveExerciseDto dto, CancellationToken ct)
        {
            var exercise = await _dbContext.Exercises.FirstOrDefaultAsync(e => e.Id == id, ct);

            if (exercise == null)
            {
                return NotFound();
            }

            exercise.ExerciseName = dto.ExerciseName.Trim();
            exercise.MuscleGroup = dto.MuscleGroup.Trim();
            exercise.CaloriesBurnedPerMinute = dto.CaloriesBurnedPerMinute;

            await _dbContext.SaveChangesAsync(ct);

            return Ok(new ExerciseDto
            {
                Id = exercise.Id,
                ExerciseName = exercise.ExerciseName,
                MuscleGroup = exercise.MuscleGroup,
                CaloriesBurnedPerMinute = exercise.CaloriesBurnedPerMinute
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExercise(long id, CancellationToken ct)
        {
            var exercise = await _dbContext.Exercises.FirstOrDefaultAsync(e => e.Id == id, ct);

            if (exercise == null)
            {
                return NotFound();
            }

            var isUsed = await _dbContext.WorkoutLogItems.AnyAsync(wli => wli.ExerciseId == id, ct)
                || await _dbContext.PlanExerciseItems.AnyAsync(pei => pei.ExerciseId == id, ct);

            if (isUsed)
            {
                return BadRequest("Cannot delete this exercise because it's used in existing workout logs or workout plans.");
            }

            _dbContext.Exercises.Remove(exercise);
            await _dbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}