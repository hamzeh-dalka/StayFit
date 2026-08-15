using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class WorkoutLog
    {
        public long Id { get; set; }
        public DateTime LoggedAt { get; set; }
        public int DurationMinutes { get; set; }

        [ForeignKey("ClientProfile")]
        public long ClientProfileId { get; set; }
        public ClientProfile ClientProfile { get; set; } = null!;
    }
}
