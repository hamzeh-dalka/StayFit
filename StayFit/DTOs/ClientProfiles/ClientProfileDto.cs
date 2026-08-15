using StayFit.Enums;

namespace StayFit.DTOs.ClientProfiles
{
    public class ClientProfileDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float HeightCm { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public Gender Gender { get; set; }
    }
}
