using StayFit.Enums;

namespace StayFit.DTOs.CoachProfiles
{
    public class FilterCoachProfiles
    {
        public Specialty? Specialty { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
