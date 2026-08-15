using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.WorkoutPlans;
using StayFit.Enums;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Authorize(Roles = "Coach,Client")]
    [Route("api/workout-plans")]
    [ApiController]
    public class WorkoutPlansController : BaseApiController
    {
        public WorkoutPlansController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [HttpGet]
        public async Task<IActionResult> GetMyWorkoutPlans(CancellationToken ct)
        {
            var role = GetCurrentUserRole();
            var query = DbContext.WorkoutPlans
                .Include(wp => wp.CoachProfile).ThenInclude(cp => cp.User)
                .Include(wp => wp.ClientProfile).ThenInclude(cp => cp.User)
                .AsQueryable();

            if (role == Role.Coach)
            {
                var coachProfile = await GetCurrentCoachProfileAsync(ct);
                if (coachProfile == null) return NotFound("Coach profile not found.");
                query = query.Where(wp => wp.CoachProfileId == coachProfile.Id);
            }
            else
            {
                var clientProfile = await GetCurrentClientProfileAsync(ct);
                if (clientProfile == null) return NotFound("Client profile not found.");
                query = query.Where(wp => wp.ClientProfileId == clientProfile.Id);
            }

            var plans = await query
                .OrderByDescending(wp => wp.CreatedAt)
                .Select(wp => new WorkoutPlanDto
                {
                    Id = wp.Id,
                    Title = wp.Title,
                    CreatedAt = wp.CreatedAt,
                    CoachName = wp.CoachProfile.User.Name,
                    ClientName = wp.ClientProfile.User.Name
                })
                .ToListAsync(ct);

            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkoutPlan(long id, CancellationToken ct)
        {
            var plan = await DbContext.WorkoutPlans
                .Include(wp => wp.CoachProfile).ThenInclude(cp => cp.User)
                .Include(wp => wp.ClientProfile).ThenInclude(cp => cp.User)
                .FirstOrDefaultAsync(wp => wp.Id == id, ct);

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

            var items = await DbContext.PlanExerciseItems
                .Include(pei => pei.Exercise)
                .Where(pei => pei.WorkoutPlanId == id)
                .Select(pei => new PlanExerciseItemDto
                {
                    Id = pei.Id,
                    ExerciseId = pei.ExerciseId,
                    ExerciseName = pei.Exercise.ExerciseName,
                    Sets = pei.Sets,
                    Reps = pei.Reps,
                    DayOfWeek = pei.DayOfWeek
                })
                .ToListAsync(ct);

            return Ok(new WorkoutPlanDetailDto
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
        public async Task<IActionResult> CreateWorkoutPlan([FromBody] SaveWorkoutPlanDto dto, CancellationToken ct)
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

            var plan = new WorkoutPlan
            {
                CoachProfileId = coachProfile.Id,
                ClientProfileId = dto.ClientProfileId,
                Title = dto.Title.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            DbContext.WorkoutPlans.Add(plan);
            await DbContext.SaveChangesAsync(ct);

            return Ok(new WorkoutPlanDto
            {
                Id = plan.Id,
                Title = plan.Title,
                CreatedAt = plan.CreatedAt
            });
        }

        [Authorize(Roles = "Coach")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkoutPlan(long id, [FromBody] SaveWorkoutPlanDto dto, CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var plan = await DbContext.WorkoutPlans.FirstOrDefaultAsync(wp => wp.Id == id, ct);

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

            return Ok(new WorkoutPlanDto
            {
                Id = plan.Id,
                Title = plan.Title,
                CreatedAt = plan.CreatedAt
            });
        }

        [Authorize(Roles = "Coach")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkoutPlan(long id, CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var plan = await DbContext.WorkoutPlans.FirstOrDefaultAsync(wp => wp.Id == id, ct);

            if (plan == null)
            {
                return NotFound();
            }

            if (plan.CoachProfileId != coachProfile.Id)
            {
                return Forbid();
            }

            DbContext.WorkoutPlans.Remove(plan);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Coach")]
        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddPlanExerciseItem(long id, [FromBody] AddPlanExerciseItemDto dto, CancellationToken ct)
        {
            var coachProfile = await GetCurrentCoachProfileAsync(ct);
            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var plan = await DbContext.WorkoutPlans.FirstOrDefaultAsync(wp => wp.Id == id, ct);

            if (plan == null)
            {
                return NotFound("Workout plan not found.");
            }

            if (plan.CoachProfileId != coachProfile.Id)
            {
                return Forbid();
            }

            var exerciseExists = await DbContext.Exercises.AnyAsync(e => e.Id == dto.ExerciseId, ct);
            if (!exerciseExists)
            {
                return NotFound("Exercise not found.");
            }

            var planExerciseItem = new PlanExerciseItem
            {
                WorkoutPlanId = id,
                ExerciseId = dto.ExerciseId,
                Sets = dto.Sets,
                Reps = dto.Reps,
                DayOfWeek = dto.DayOfWeek
            };

            DbContext.PlanExerciseItems.Add(planExerciseItem);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}