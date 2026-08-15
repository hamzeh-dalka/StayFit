using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.ClientProfiles;
using StayFit.Enums;
using System.Security.Claims;

namespace StayFit.Controllers
{
    [Authorize]
    [Route("api/client-profiles")]
    [ApiController]
    public class ClientProfilesController : ControllerBase
    {
        private readonly StayFitDbContext _dbContext;

        public ClientProfilesController(StayFitDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [Authorize(Roles = "Coach,Admin,SuperAdmin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClientProfile(long id, CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            if (currentUserRole == Role.Coach)
            {
                var isLinked = await _dbContext.CoachClients
                    .AnyAsync(cc =>
                        cc.ClientProfileId == id &&
                        cc.CoachProfile.UserId == currentUserId &&
                        cc.Status == CoachClientStatus.Accepted, ct);

                if (!isLinked)
                {
                    return Forbid();
                }
            }

            var client = await _dbContext.ClientProfiles
                .Include(c => c.User)
                .Where(c => c.Id == id)
                .Select(c => new ClientProfileDto
                {
                    Id = c.Id,
                    Name = c.User.Name,
                    HeightCm = c.HeightCm,
                    DateOfBirth = c.DateOfBirth,
                    Gender = c.Gender
                })
                .FirstOrDefaultAsync(ct);

            if (client == null)
            {
                return NotFound();
            }

            return Ok(client);
        }

        [Authorize(Roles = "Client")]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyClientProfile([FromBody] SaveClientProfileDto dto, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var client = await _dbContext.ClientProfiles
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.UserId == userId, ct);

            if (client == null)
            {
                return NotFound("Client profile not found.");
            }

            client.HeightCm = dto.HeightCm;
            client.DateOfBirth = dto.DateOfBirth;
            client.Gender = dto.Gender;

            await _dbContext.SaveChangesAsync(ct);

            return Ok(new ClientProfileDto
            {
                Id = client.Id,
                Name = client.User.Name,
                HeightCm = client.HeightCm,
                DateOfBirth = client.DateOfBirth,
                Gender = client.Gender
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

        private Role GetCurrentUserRole()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (string.IsNullOrEmpty(role))
            {
                throw new UnauthorizedAccessException();
            }
            return Enum.Parse<Role>(role);
        }
    }
}