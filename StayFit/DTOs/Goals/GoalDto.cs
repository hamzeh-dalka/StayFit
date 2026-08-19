using StayFit.Enums;

namespace StayFit.DTOs.Goals
{
    public class GoalDto
    {
        public long Id { get; set; }
        public GoalType GoalType { get; set; }
        public float TargetValue { get; set; }
        public float CurrentValue { get; set; }
        public DateOnly Deadline { get; set; }
    }
}
