namespace StayFit.DTOs.WeightLogs
{
    public class FilterWeightLogs
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }
}
