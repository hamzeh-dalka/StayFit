using StayFit.Enums;

namespace StayFit.DTOs.Meals
{
    public class MealDetailDto
    {
        public long Id { get; set; }
        public MealType MealType { get; set; }
        public DateTime LoggedAt { get; set; }
        public List<MealItemDto> Items { get; set; } = new();
    }
}
