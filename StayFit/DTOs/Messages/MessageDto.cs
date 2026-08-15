namespace StayFit.DTOs.Messages
{
    public class MessageDto
    {
        public long Id { get; set; }
        public long SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public long ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }
}
