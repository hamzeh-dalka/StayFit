namespace StayFit.DTOs.WorkoutLogs
{
    public class WorkoutLogDetailDto
    {
        public long Id { get; set; }
        public DateTime LoggedAt { get; set; }
        public int DurationMinutes { get; set; }
        public List<WorkoutLogItemDto> Items { get; set; } = new();
    }
}
