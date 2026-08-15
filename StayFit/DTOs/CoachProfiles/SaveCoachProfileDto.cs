using StayFit.Enums;

namespace StayFit.DTOs.CoachProfiles
{
    public class SaveCoachProfileDto
    {
        public Specialty Specialty { get; set; }
        public string Bio { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
    }
}
