using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class WorkoutPlan
    {
        public long Id { get; set; }

        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ClientProfile")]
        public long ClientProfileId { get; set; }
        public ClientProfile ClientProfile { get; set; } = null!;

        [ForeignKey("CoachProfile")]
        public long CoachProfileId { get; set; }
        public CoachProfile CoachProfile { get; set; } = null!;
    }
}
