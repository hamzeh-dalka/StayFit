using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.CoachProfiles;
using System.Security.Claims;

namespace StayFit.Controllers
{
    [Route("api/coach-profiles")]
    [ApiController]
    public class CoachProfilesController : ControllerBase
    {
        private readonly StayFitDbContext _dbContext;

        public CoachProfilesController(StayFitDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllCoachProfiles([FromQuery] FilterCoachProfiles filter, CancellationToken ct)
        {
            var query = _dbContext.CoachProfiles
                .Include(c => c.User)
                .AsQueryable();

            if (filter.Specialty.HasValue)
            {
                query = query.Where(c => c.Specialty == filter.Specialty.Value);
            }

            var coaches = await query
                .OrderBy(c => c.User.Name)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(c => new CoachProfileDto
                {
                    Id = c.Id,
                    Name = c.User.Name,
                    Specialty = c.Specialty,
                    Bio = c.Bio,
                    ExperienceYears = c.ExperienceYears
                })
                .ToListAsync(ct);

            return Ok(coaches);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCoachProfile(long id, CancellationToken ct)
        {
            var coach = await _dbContext.CoachProfiles
                .Include(c => c.User)
                .Where(c => c.Id == id)
                .Select(c => new CoachProfileDto
                {
                    Id = c.Id,
                    Name = c.User.Name,
                    Specialty = c.Specialty,
                    Bio = c.Bio,
                    ExperienceYears = c.ExperienceYears
                })
                .FirstOrDefaultAsync(ct);

            if (coach == null)
            {
                return NotFound();
            }

            return Ok(coach);
        }

        [Authorize(Roles = "Coach")]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyCoachProfile([FromBody] SaveCoachProfileDto dto, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var coach = await _dbContext.CoachProfiles
                .FirstOrDefaultAsync(c => c.UserId == userId, ct);

            if (coach == null)
            {
                return NotFound("Coach profile not found.");
            }

            coach.Specialty = dto.Specialty;
            coach.Bio = dto.Bio;
            coach.ExperienceYears = dto.ExperienceYears;

            await _dbContext.SaveChangesAsync(ct);

            return Ok(new CoachProfileDto
            {
                Id = coach.Id,
                Name = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
                Specialty = coach.Specialty,
                Bio = coach.Bio,
                ExperienceYears = coach.ExperienceYears
            });
        }

        private long GetCurrentUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(id))
            {
                throw new UnauthorizedAccessException();
            }
            return long.Parse(id);
        }
    }
}