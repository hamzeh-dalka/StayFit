using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class WeightLog
    {
        public long Id { get; set; }
        public float WeightKg { get; set; }
        public DateTime RecordedAt { get; set; }

        [ForeignKey("ClientProfile")]
        public long ClientProfileId { get; set; }
        public ClientProfile ClientProfile { get; set; } = null!;
    }
}
