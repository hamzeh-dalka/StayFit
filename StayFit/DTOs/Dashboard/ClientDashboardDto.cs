namespace StayFit.DTOs.Dashboard
{
    public class ClientDashboardDto
    {
        public float TodayCalories { get; set; }
        public float? LatestWeightKg { get; set; }
        public int ActiveGoalsCount { get; set; }
        public int WorkoutsThisWeek { get; set; }
    }
}
