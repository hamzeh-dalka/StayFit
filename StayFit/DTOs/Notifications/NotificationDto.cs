using StayFit.Enums;

namespace StayFit.DTOs.Notifications
{
    public class NotificationDto
    {
        public long Id { get; set; }
        public NotificationType Type { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
