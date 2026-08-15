using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.Notifications;

namespace StayFit.Controllers
{
    [Authorize]
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : BaseApiController
    {
        public NotificationsController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications(CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var notifications = await DbContext.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Type = n.Type,
                    Message = n.Message,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync(ct);

            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(long id, CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var notification = await DbContext.Notifications.FirstOrDefaultAsync(n => n.Id == id, ct);

            if (notification == null)
            {
                return NotFound();
            }

            if (notification.UserId != userId)
            {
                return Forbid();
            }

            notification.IsRead = true;
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
        {
            var userId = GetCurrentUserId();

            var unreadNotifications = await DbContext.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync(ct);

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }

            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}