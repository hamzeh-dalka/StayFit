using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.WorkoutLogs;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Authorize]
    [Route("api/workout-logs")]
    [ApiController]
    public class WorkoutLogsController : BaseApiController
    {
        public WorkoutLogsController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [Authorize(Roles = "Client")]
        [HttpGet]
        public async Task<IActionResult> GetMyWorkoutLogs([FromQuery] FilterWorkoutLogs filter, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var query = DbContext.WorkoutLogs.Where(w => w.ClientProfileId == clientProfile.Id);

            if (filter.FromDate.HasValue)
            {
                query = query.Where(w => w.LoggedAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(w => w.LoggedAt <= filter.ToDate.Value);
            }

            var logs = await query
                .OrderByDescending(w => w.LoggedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(w => new WorkoutLogDto
                {
                    Id = w.Id,
                    LoggedAt = w.LoggedAt,
                    DurationMinutes = w.DurationMinutes
                })
                .ToListAsync(ct);

            return Ok(logs);
        }

        [Authorize(Roles = "Client,Coach")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkoutLog(long id, CancellationToken ct)
        {
            var workoutLog = await DbContext.WorkoutLogs
                .FirstOrDefaultAsync(w => w.Id == id, ct);

            if (workoutLog == null)
            {
                return NotFound();
            }

            var canAccess = await CanAccessClientDataAsync(workoutLog.ClientProfileId, ct);
            if (!canAccess)
            {
                return Forbid();
            }

            var items = await DbContext.WorkoutLogItems
                .Include(wli => wli.Exercise)
                .Where(wli => wli.WorkoutLogId == id)
                .Select(wli => new WorkoutLogItemDto
                {
                    Id = wli.Id,
                    ExerciseId = wli.ExerciseId,
                    ExerciseName = wli.Exercise.ExerciseName,
                    Sets = wli.Sets,
                    Reps = wli.Reps
                })
                .ToListAsync(ct);

            return Ok(new WorkoutLogDetailDto
            {
                Id = workoutLog.Id,
                LoggedAt = workoutLog.LoggedAt,
                DurationMinutes = workoutLog.DurationMinutes,
                Items = items
            });
        }

        [Authorize(Roles = "Client")]
        [HttpPost]
        public async Task<IActionResult> CreateWorkoutLog([FromBody] SaveWorkoutLogDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var workoutLog = new WorkoutLog
            {
                ClientProfileId = clientProfile.Id,
                LoggedAt = dto.LoggedAt,
                DurationMinutes = dto.DurationMinutes
            };

            DbContext.WorkoutLogs.Add(workoutLog);
            await DbContext.SaveChangesAsync(ct);

            return Ok(new WorkoutLogDto
            {
                Id = workoutLog.Id,
                LoggedAt = workoutLog.LoggedAt,
                DurationMinutes = workoutLog.DurationMinutes
            });
        }

        [Authorize(Roles = "Client")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkoutLog(long id, [FromBody] SaveWorkoutLogDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var workoutLog = await DbContext.WorkoutLogs.FirstOrDefaultAsync(w => w.Id == id, ct);

            if (workoutLog == null)
            {
                return NotFound();
            }

            if (workoutLog.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            workoutLog.LoggedAt = dto.LoggedAt;
            workoutLog.DurationMinutes = dto.DurationMinutes;

            await DbContext.SaveChangesAsync(ct);

            return Ok(new WorkoutLogDto
            {
                Id = workoutLog.Id,
                LoggedAt = workoutLog.LoggedAt,
                DurationMinutes = workoutLog.DurationMinutes
            });
        }

        [Authorize(Roles = "Client")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkoutLog(long id, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var workoutLog = await DbContext.WorkoutLogs.FirstOrDefaultAsync(w => w.Id == id, ct);

            if (workoutLog == null)
            {
                return NotFound();
            }

            if (workoutLog.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            DbContext.WorkoutLogs.Remove(workoutLog);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Client")]
        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddWorkoutLogItem(long id, [FromBody] AddWorkoutLogItemDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var workoutLog = await DbContext.WorkoutLogs.FirstOrDefaultAsync(w => w.Id == id, ct);

            if (workoutLog == null)
            {
                return NotFound("Workout log not found.");
            }

            if (workoutLog.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            var exerciseExists = await DbContext.Exercises.AnyAsync(e => e.Id == dto.ExerciseId, ct);
            if (!exerciseExists)
            {
                return NotFound("Exercise not found.");
            }

            var workoutLogItem = new WorkoutLogItem
            {
                WorkoutLogId = id,
                ExerciseId = dto.ExerciseId,
                Sets = dto.Sets,
                Reps = dto.Reps
            };

            DbContext.WorkoutLogItems.Add(workoutLogItem);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}