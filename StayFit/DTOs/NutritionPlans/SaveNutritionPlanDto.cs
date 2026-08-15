namespace StayFit.DTOs.NutritionPlans
{
    public class SaveNutritionPlanDto
    {
        public long ClientProfileId { get; set; }
        public string Title { get; set; } = string.Empty;
    }
}
