using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.Enums;
using StayFit.Models;
using System.Security.Claims;

namespace StayFit.Controllers
{
    public abstract class BaseApiController : ControllerBase
    {
        protected readonly StayFitDbContext DbContext;

        protected BaseApiController(StayFitDbContext dbContext)
        {
            DbContext = dbContext;
        }

        protected long GetCurrentUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(id))
            {
                throw new UnauthorizedAccessException();
            }
            return long.Parse(id);
        }

        protected Role GetCurrentUserRole()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (string.IsNullOrEmpty(role))
            {
                throw new UnauthorizedAccessException();
            }
            return Enum.Parse<Role>(role);
        }

        protected async Task<ClientProfile?> GetCurrentClientProfileAsync(CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            return await DbContext.ClientProfiles.FirstOrDefaultAsync(c => c.UserId == userId, ct);
        }

        protected async Task<CoachProfile?> GetCurrentCoachProfileAsync(CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            return await DbContext.CoachProfiles.FirstOrDefaultAsync(c => c.UserId == userId, ct);
        }

        protected async Task<bool> CanAccessClientDataAsync(long clientProfileId, CancellationToken ct)
        {
            var userId = GetCurrentUserId();
            var role = GetCurrentUserRole();

            if (role == Role.Client)
            {
                var clientProfile = await DbContext.ClientProfiles
                    .FirstOrDefaultAsync(c => c.UserId == userId, ct);
                return clientProfile != null && clientProfile.Id == clientProfileId;
            }

            if (role == Role.Coach)
            {
                return await DbContext.CoachClients.AnyAsync(cc =>
                    cc.ClientProfileId == clientProfileId &&
                    cc.CoachProfile.UserId == userId &&
                    cc.Status == CoachClientStatus.Accepted, ct);
            }

            return false;
        }

        protected async Task<bool> IsCoachLinkedToClientAsync(long coachProfileId, long clientProfileId, CancellationToken ct)
        {
            return await DbContext.CoachClients.AnyAsync(cc =>
                cc.CoachProfileId == coachProfileId &&
                cc.ClientProfileId == clientProfileId &&
                cc.Status == CoachClientStatus.Accepted, ct);
        }
    }
}