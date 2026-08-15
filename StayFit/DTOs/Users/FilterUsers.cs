namespace StayFit.DTOs.Users
{
    public class FilterUsers
    {
        public long? Id { get; set; }
        public string? Name { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
