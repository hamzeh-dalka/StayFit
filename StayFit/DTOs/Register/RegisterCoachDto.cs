using StayFit.Enums;

namespace StayFit.DTOs.Register
{
    public class RegisterCoachDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public Specialty Specialty { get; set; }
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }
    }
}
