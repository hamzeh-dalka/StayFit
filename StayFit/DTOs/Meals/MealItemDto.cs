namespace StayFit.DTOs.Meals
{
    public class MealItemDto
    {
        public long Id { get; set; }
        public long FoodItemId { get; set; }
        public string FoodItemName { get; set; } = string.Empty;
        public float QuantityInGrams { get; set; }
        public int CaloriesPer100g { get; set; }
    }
}
