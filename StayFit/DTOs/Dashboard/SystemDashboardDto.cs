namespace StayFit.DTOs.Dashboard
{
    public class SystemDashboardDto
    {
        public int TotalMessages { get; set; }
        public int TotalNotifications { get; set; }
        public int PendingCoachClientRequests { get; set; }
        public int TotalNutritionPlans { get; set; }
        public int TotalWorkoutPlans { get; set; }
        public DateTime? LastUserRegisteredAt { get; set; }
    }
}
