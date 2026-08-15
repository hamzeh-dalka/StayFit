namespace StayFit.DTOs.WorkoutPlans
{
    public class WorkoutPlanDetailDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CoachName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public List<PlanExerciseItemDto> Items { get; set; } = new();
    }
}
