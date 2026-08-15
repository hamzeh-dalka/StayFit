using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class PlanMealItem
    {
        public long Id { get; set; }
        public float QuantityGrams { get; set; }
        public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        [ForeignKey("NutritionPlan")]
        public long NutritionPlanId { get; set; }
        public NutritionPlan NutritionPlan { get; set; } = null!;

        [ForeignKey("FoodItem")]
        public long FoodItemId { get; set; }
        public FoodItem FoodItem { get; set; } = null!;
    }
}
