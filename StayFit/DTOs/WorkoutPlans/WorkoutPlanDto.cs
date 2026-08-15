namespace StayFit.DTOs.WorkoutPlans
{
    public class WorkoutPlanDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CoachName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;

    }
}
