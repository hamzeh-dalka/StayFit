namespace StayFit.DTOs.WorkoutLogs
{
    public class WorkoutLogItemDto
    {
        public long Id { get; set; }
        public long ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Reps { get; set; }
    }
}
