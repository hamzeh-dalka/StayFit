using StayFit.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class Goal
    {
        public long Id { get; set; }
        public GoalType GoalType { get; set; }
        public float TargetValue { get; set; }
        public DateOnly Deadline { get; set; }

        [ForeignKey("ClientProfile")]
        public long ClientProfileId { get; set; }
        public ClientProfile ClientProfile { get; set; } = null!;

    }
}
