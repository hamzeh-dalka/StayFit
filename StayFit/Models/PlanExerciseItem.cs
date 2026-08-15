using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class PlanExerciseItem
    {
        public long Id { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        [ForeignKey("WorkoutPlan")]
        public long WorkoutPlanId { get; set; }
        public WorkoutPlan WorkoutPlan { get; set; } = null!;

        [ForeignKey("Exercise")]
        public long ExerciseId { get; set; }
        public Exercise Exercise { get; set; } = null!;
    }
}
