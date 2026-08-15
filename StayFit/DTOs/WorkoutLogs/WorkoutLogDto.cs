namespace StayFit.DTOs.WorkoutLogs
{
    public class WorkoutLogDto
    {
        public long Id { get; set; }
        public DateTime LoggedAt { get; set; }
        public int DurationMinutes { get; set; }
    }
}
