using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.Users;
using StayFit.Enums;

namespace StayFit.Controllers
{
    [Authorize]
    [Route("api/Users")]
    [ApiController]
    public class UsersController : BaseApiController
    {
        public UsersController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpGet("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers([FromQuery] FilterUsers filterUsers, CancellationToken ct)
        {
            var query = DbContext.Users.AsQueryable();

            if (filterUsers.Id.HasValue)
            {
                query = query.Where(x => x.Id == filterUsers.Id.Value);
            }

            if (!string.IsNullOrEmpty(filterUsers.Name))
            {
                query = query.Where(x => x.Name.Contains(filterUsers.Name));
            }

            var users = await query
                .OrderBy(x => x.Name)
                .Skip((filterUsers.PageNumber - 1) * filterUsers.PageSize)
                .Take(filterUsers.PageSize)
                .Select(x => new UserDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Email = x.Email,
                    Role = x.Role,
                    IsApproved = x.IsApproved
                }).ToListAsync(ct);

            return Ok(users);
        }

        [HttpGet("Me")]
        public async Task<IActionResult> GetMe(CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var user = await DbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsApproved = user.IsApproved
            });
        }

        [HttpPut("UpdateMe")]
        public async Task<IActionResult> UpdateMe([FromBody] SaveUserDto saveUserDto, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var user = await DbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);

            if (user == null)
            {
                return NotFound();
            }

            user.Name = saveUserDto.Name;
            user.Email = saveUserDto.Email;

            await DbContext.SaveChangesAsync(ct);

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsApproved = user.IsApproved
            });
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(long id, CancellationToken ct)
        {
            var user = await DbContext.Users.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (user == null)
            {
                return NotFound();
            }

            var hasRelatedData = await DbContext.CoachClients
                .AnyAsync(x => x.CoachProfile.UserId == id || x.ClientProfile.UserId == id, ct)
                || await DbContext.NutritionPlans
                .AnyAsync(x => x.CoachProfile.UserId == id || x.ClientProfile.UserId == id, ct)
                || await DbContext.WorkoutPlans
                .AnyAsync(x => x.CoachProfile.UserId == id || x.ClientProfile.UserId == id, ct)
                || await DbContext.Meals
                .AnyAsync(x => x.ClientProfile.UserId == id, ct)
                || await DbContext.WorkoutLogs
                .AnyAsync(x => x.ClientProfile.UserId == id, ct)
                || await DbContext.WeightLogs
                .AnyAsync(x => x.ClientProfile.UserId == id, ct)
                || await DbContext.Goals
                .AnyAsync(x => x.ClientProfile.UserId == id, ct);

            if (hasRelatedData)
            {
                return BadRequest("Cannot delete user with related data.");
            }

            DbContext.Users.Remove(user);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("pending-coaches")]
        public async Task<IActionResult> GetPendingCoaches(CancellationToken ct)
        {
            var pending = await DbContext.Users
                .Where(u => u.Role == Role.Coach && !u.IsApproved)
                .Select(u => new UserDto { Id = u.Id, Name = u.Name, Email = u.Email, Role = u.Role , IsApproved = u.IsApproved})
                .ToListAsync(ct);

            return Ok(pending);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveCoach(long id, CancellationToken ct)
        {
            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == Role.Coach, ct);

            if (user == null) return NotFound();

            user.IsApproved = true;
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}/reject")]
        public async Task<IActionResult> RejectCoach(long id, CancellationToken ct)
        {
            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == Role.Coach && !u.IsApproved, ct);

            if (user == null) return NotFound();

            DbContext.Users.Remove(user);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}