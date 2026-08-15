using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.Messages;
using StayFit.Enums;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Authorize(Roles = "Coach,Client")]
    [Route("api/messages")]
    [ApiController]
    public class MessagesController : BaseApiController
    {
        public MessagesController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [HttpGet("conversation/{userId}")]
        public async Task<IActionResult> GetConversation(long userId, CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();

            var isLinked = await AreUsersLinkedAsync(currentUserId, userId, ct);
            if (!isLinked)
            {
                return Forbid();
            }

            var messages = await DbContext.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m =>
                    (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                    (m.SenderId == userId && m.ReceiverId == currentUserId))
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.Name,
                    ReceiverId = m.ReceiverId,
                    ReceiverName = m.Receiver.Name,
                    Content = m.Content,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead
                })
                .ToListAsync(ct);

            return Ok(messages);
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto, CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();

            if (dto.ReceiverId == currentUserId)
            {
                return BadRequest("You cannot send a message to yourself.");
            }

            var isLinked = await AreUsersLinkedAsync(currentUserId, dto.ReceiverId, ct);
            if (!isLinked)
            {
                return BadRequest("You can only message a coach or client you are linked to.");
            }

            var message = new Message
            {
                SenderId = currentUserId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content.Trim(),
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            DbContext.Messages.Add(message);
            await DbContext.SaveChangesAsync(ct);

            return Ok(new MessageDto
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead
            });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(long id, CancellationToken ct)
        {
            var currentUserId = GetCurrentUserId();

            var message = await DbContext.Messages.FirstOrDefaultAsync(m => m.Id == id, ct);

            if (message == null)
            {
                return NotFound();
            }

            if (message.ReceiverId != currentUserId)
            {
                return Forbid();
            }

            message.IsRead = true;
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }

        private async Task<bool> AreUsersLinkedAsync(long userIdA, long userIdB, CancellationToken ct)
        {
            return await DbContext.CoachClients.AnyAsync(cc =>
                cc.Status == CoachClientStatus.Accepted &&
                (
                    (cc.CoachProfile.UserId == userIdA && cc.ClientProfile.UserId == userIdB) ||
                    (cc.CoachProfile.UserId == userIdB && cc.ClientProfile.UserId == userIdA)
                ), ct);
        }
    }
}