namespace StayFit.DTOs.FoodItems
{
    public class SaveFoodItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int CaloriesPer100g { get; set; }
        public float ProteinPer100g { get; set; }
        public float CarbsPer100g { get; set; }
        public float FatPer100g { get; set; }
    }
}
