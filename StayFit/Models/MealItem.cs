using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class MealItem
    {
        public long Id { get; set; }
        public float QuantityInGrams { get; set; }

        [ForeignKey("FoodItem")]
        public long FoodItemId { get; set; }
        public FoodItem FoodItem { get; set; } = null!;

        [ForeignKey("Meal")]
        public long MealId { get; set; }
        public Meal Meal { get; set; } = null!;
    }
}
