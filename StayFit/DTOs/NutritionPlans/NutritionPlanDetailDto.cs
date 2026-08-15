namespace StayFit.DTOs.NutritionPlans
{
    public class NutritionPlanDetailDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CoachName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public List<PlanMealItemDto> Items { get; set; } = new();
    }
}
