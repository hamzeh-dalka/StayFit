using StayFit.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class Meal
    {
        public long Id { get; set; }
        public MealType MealType { get; set; }
        public DateTime LoggedAt { get; set; }

        [ForeignKey("ClientProfile")]
        public long ClientProfileId { get; set; }
        public ClientProfile ClientProfile { get; set; } = null!;
    }
}
