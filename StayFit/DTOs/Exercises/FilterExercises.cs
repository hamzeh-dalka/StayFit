namespace StayFit.DTOs.Exercises
{
    public class FilterExercises
    {
        public string? Name { get; set; }
        public string? MuscleGroup { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
