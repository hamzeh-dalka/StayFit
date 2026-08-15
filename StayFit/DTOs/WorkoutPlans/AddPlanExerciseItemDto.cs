namespace StayFit.DTOs.WorkoutPlans
{
    public class AddPlanExerciseItemDto
    {
        public long ExerciseId { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int DayOfWeek { get; set; }
    }
}
