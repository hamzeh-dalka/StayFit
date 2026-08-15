using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class WorkoutLogItem
    {
        public long Id { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }

        [ForeignKey("WorkoutLog")]
        public long WorkoutLogId { get; set; }
        public WorkoutLog WorkoutLog { get; set; } = null!;

        [ForeignKey("Exercise")]
        public long ExerciseId { get; set; }
        public Exercise Exercise { get; set; } = null!;
    }
}
