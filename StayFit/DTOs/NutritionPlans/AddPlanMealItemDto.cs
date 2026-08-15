namespace StayFit.DTOs.NutritionPlans
{
    public class AddPlanMealItemDto
    {
        public long FoodItemId { get; set; }
        public float QuantityGrams { get; set; }
        public int DayOfWeek { get; set; }
    }
}
