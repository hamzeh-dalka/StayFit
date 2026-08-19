using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.Goals;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Authorize(Roles = "Client")]
    [Route("api/goals")]
    [ApiController]
    public class GoalsController : BaseApiController
    {
        public GoalsController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [HttpGet]
        public async Task<IActionResult> GetMyGoals(CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var goals = await DbContext.Goals
                .Where(g => g.ClientProfileId == clientProfile.Id)
                .OrderBy(g => g.Deadline)
                .Select(g => new GoalDto
                {
                    Id = g.Id,
                    GoalType = g.GoalType,
                    TargetValue = g.TargetValue,
                    CurrentValue = g.CurrentValue,
                    Deadline = g.Deadline
                })
                .ToListAsync(ct);

            return Ok(goals);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGoal([FromBody] SaveGoalDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var goal = new Goal
            {
                ClientProfileId = clientProfile.Id,
                GoalType = dto.GoalType,
                TargetValue = dto.TargetValue,
                CurrentValue = dto.CurrentValue,
                Deadline = dto.Deadline
            };

            DbContext.Goals.Add(goal);
            await DbContext.SaveChangesAsync(ct);

            return Ok(new GoalDto
            {
                Id = goal.Id,
                GoalType = goal.GoalType,
                TargetValue = goal.TargetValue,
                CurrentValue = goal.CurrentValue,
                Deadline = goal.Deadline
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(long id, [FromBody] SaveGoalDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var goal = await DbContext.Goals.FirstOrDefaultAsync(g => g.Id == id, ct);

            if (goal == null)
            {
                return NotFound();
            }

            if (goal.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            goal.GoalType = dto.GoalType;
            goal.TargetValue = dto.TargetValue;
            goal.CurrentValue = dto.CurrentValue;
            goal.Deadline = dto.Deadline;

            await DbContext.SaveChangesAsync(ct);

            return Ok(new GoalDto
            {
                Id = goal.Id,
                GoalType = goal.GoalType,
                TargetValue = goal.TargetValue,
                CurrentValue = goal.CurrentValue,
                Deadline = goal.Deadline
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(long id, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var goal = await DbContext.Goals.FirstOrDefaultAsync(g => g.Id == id, ct);

            if (goal == null)
            {
                return NotFound();
            }

            if (goal.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            DbContext.Goals.Remove(goal);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}