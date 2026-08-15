namespace StayFit.DTOs.WorkoutLogs
{
    public class FilterWorkoutLogs
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
