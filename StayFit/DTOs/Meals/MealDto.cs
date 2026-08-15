using StayFit.Enums;

namespace StayFit.DTOs.Meals
{
    public class MealDto
    {
        public long Id { get; set; }
        public MealType MealType { get; set; }
        public DateTime LoggedAt { get; set; }
    }
}
