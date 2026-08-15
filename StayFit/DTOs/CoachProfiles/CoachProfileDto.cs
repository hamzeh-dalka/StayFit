using StayFit.Enums;

namespace StayFit.DTOs.CoachProfiles
{
    public class CoachProfileDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Specialty Specialty { get; set; }
        public string Bio { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
    }
}
