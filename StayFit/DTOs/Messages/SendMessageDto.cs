namespace StayFit.DTOs.Messages
{
    public class SendMessageDto
    {
        public long ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
