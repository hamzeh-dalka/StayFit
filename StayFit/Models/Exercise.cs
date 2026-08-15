using System.ComponentModel.DataAnnotations;

namespace StayFit.Models
{
    public class Exercise
    {
        public long Id { get; set; }

        [MaxLength(100)]
        public string ExerciseName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string MuscleGroup { get; set; } = string.Empty;
        public float CaloriesBurnedPerMinute { get; set; }
    }
}
