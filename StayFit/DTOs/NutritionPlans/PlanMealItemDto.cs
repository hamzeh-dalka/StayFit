namespace StayFit.DTOs.NutritionPlans
{
    public class PlanMealItemDto
    {
        public long Id { get; set; }
        public long FoodItemId { get; set; }
        public string FoodItemName { get; set; } = string.Empty;
        public float QuantityGrams { get; set; }
        public int DayOfWeek { get; set; }
    }
}
