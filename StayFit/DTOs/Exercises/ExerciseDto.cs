namespace StayFit.DTOs.Exercises
{
    public class ExerciseDto
    {
        public long Id { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public float CaloriesBurnedPerMinute { get; set; }
    }
}
