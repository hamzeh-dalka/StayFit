namespace StayFit.DTOs.WorkoutLogs
{
    public class AddWorkoutLogItemDto
    {
        public long ExerciseId { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
    }
}
