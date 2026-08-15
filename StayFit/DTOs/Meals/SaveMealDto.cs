using StayFit.Enums;

namespace StayFit.DTOs.Meals
{
    public class SaveMealDto
    {
        public MealType MealType { get; set; }
        public DateTime LoggedAt { get; set; }
    }
}
