using StayFit.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class Notification
    {
        public long Id { get; set; }
        public NotificationType Type { get; set; }

        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("User")]
        public long UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
