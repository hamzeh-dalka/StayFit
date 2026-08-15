namespace StayFit.DTOs.WorkoutPlans
{
    public class PlanExerciseItemDto
    {
        public long Id { get; set; }
        public long ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int DayOfWeek { get; set; }
    }
}
