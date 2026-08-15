using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class Message
    {
        public long Id { get; set; }

        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        [ForeignKey("Sender")]
        public long SenderId { get; set; }
        public User Sender { get; set; } = null!;

        [ForeignKey("Receiver")]
        public long ReceiverId { get; set; }
        public User Receiver { get; set; } = null!;
    }
}
