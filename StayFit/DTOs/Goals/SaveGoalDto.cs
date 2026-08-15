using StayFit.Enums;

namespace StayFit.DTOs.Goals
{
    public class SaveGoalDto
    {
        public GoalType GoalType { get; set; }
        public float TargetValue { get; set; }
        public DateOnly Deadline { get; set; }
    }
}
