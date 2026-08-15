using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.CoachClient;
using StayFit.Enums;
using System.Security.Claims;

namespace StayFit.Controllers
{
    [Authorize]
    [Route("api/coach-client")]
    [ApiController]
    public class CoachClientController : ControllerBase
    {
        private readonly StayFitDbContext _dbContext;

        public CoachClientController(StayFitDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [Authorize(Roles = "Client")]
        [HttpPost("request/{coachId}")]
        public async Task<IActionResult> RequestCoach(long coachId, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var clientProfile = await _dbContext.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserId == userId, ct);

            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var coachExists = await _dbContext.CoachProfiles.AnyAsync(c => c.Id == coachId, ct);
            if (!coachExists)
            {
                return NotFound("Coach not found.");
            }

            var alreadyExists = await _dbContext.CoachClients.AnyAsync(cc =>
                cc.CoachProfileId == coachId &&
                cc.ClientProfileId == clientProfile.Id &&
                cc.Status != CoachClientStatus.Rejected, ct);

            if (alreadyExists)
            {
                return BadRequest("A request or active relation already exists with this coach.");
            }

            var coachClient = new Models.CoachClient
            {
                CoachProfileId = coachId,
                ClientProfileId = clientProfile.Id,
                Status = CoachClientStatus.Pending,
                RequestedAt = DateTime.UtcNow
            };

            _dbContext.CoachClients.Add(coachClient);
            await _dbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Coach")]
        [HttpGet("my-clients")]
        public async Task<IActionResult> GetMyClients(CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var coachProfile = await _dbContext.CoachProfiles
                .FirstOrDefaultAsync(c => c.UserId == userId, ct);

            if (coachProfile == null)
            {
                return NotFound("Coach profile not found.");
            }

            var clients = await _dbContext.CoachClients
                .Include(cc => cc.ClientProfile)
                .ThenInclude(cp => cp.User)
                .Where(cc => cc.CoachProfileId == coachProfile.Id)
                .Select(cc => new CoachClientDto
                {
                    Id = cc.Id,
                    Name = cc.ClientProfile.User.Name,
                    Status = cc.Status,
                    RequestedAt = cc.RequestedAt
                })
                .ToListAsync(ct);

            return Ok(clients);
        }

        [Authorize(Roles = "Client")]
        [HttpGet("my-coaches")]
        public async Task<IActionResult> GetMyCoaches(CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var clientProfile = await _dbContext.ClientProfiles
                .FirstOrDefaultAsync(c => c.UserId == userId, ct);

            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var coaches = await _dbContext.CoachClients
                .Include(cc => cc.CoachProfile)
                .ThenInclude(cp => cp.User)
                .Where(cc => cc.ClientProfileId == clientProfile.Id)
                .Select(cc => new CoachClientDto
                {
                    Id = cc.Id,
                    Name = cc.CoachProfile.User.Name,
                    Status = cc.Status,
                    RequestedAt = cc.RequestedAt
                })
                .ToListAsync(ct);

            return Ok(coaches);
        }

        [Authorize(Roles = "Coach")]
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptRequest(long id, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var coachClient = await _dbContext.CoachClients
                .Include(cc => cc.CoachProfile)
                .FirstOrDefaultAsync(cc => cc.Id == id, ct);

            if (coachClient == null)
            {
                return NotFound();
            }

            if (coachClient.CoachProfile.UserId != userId)
            {
                return Forbid();
            }

            if (coachClient.Status != CoachClientStatus.Pending)
            {
                return BadRequest("This request is not pending.");
            }

            coachClient.Status = CoachClientStatus.Accepted;
            await _dbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Coach")]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectRequest(long id, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var coachClient = await _dbContext.CoachClients
                .Include(cc => cc.CoachProfile)
                .FirstOrDefaultAsync(cc => cc.Id == id, ct);

            if (coachClient == null)
            {
                return NotFound();
            }

            if (coachClient.CoachProfile.UserId != userId)
            {
                return Forbid();
            }

            if (coachClient.Status != CoachClientStatus.Pending)
            {
                return BadRequest("This request is not pending.");
            }

            coachClient.Status = CoachClientStatus.Rejected;
            await _dbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Coach,Client")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> EndRelation(long id, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var coachClient = await _dbContext.CoachClients
                .Include(cc => cc.CoachProfile)
                .Include(cc => cc.ClientProfile)
                .FirstOrDefaultAsync(cc => cc.Id == id, ct);

            if (coachClient == null)
            {
                return NotFound();
            }

            var isOwner = coachClient.CoachProfile.UserId == userId || coachClient.ClientProfile.UserId == userId;

            if (!isOwner)
            {
                return Forbid();
            }

            _dbContext.CoachClients.Remove(coachClient);
            await _dbContext.SaveChangesAsync(ct);

            return Ok();
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