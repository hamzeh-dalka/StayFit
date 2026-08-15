using System.ComponentModel.DataAnnotations;

namespace StayFit.Models
{
    public class FoodItem
    {
        public long Id { get; set; }

        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public int CaloriesPer100g { get; set; }
        public float ProteinPer100g { get; set; }
        public float CarbsPer100g { get; set; }
        public float FatPer100g { get; set; }
    }
}
