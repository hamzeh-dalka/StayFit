namespace StayFit.DTOs.WorkoutPlans
{
    public class SaveWorkoutPlanDto
    {
        public long ClientProfileId { get; set; }
        public string Title { get; set; } = string.Empty;
    }
}
