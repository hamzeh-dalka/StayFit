using StayFit.Enums;

namespace StayFit.DTOs.ClientProfiles
{
    public class SaveClientProfileDto
    {
        public float HeightCm { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public Gender Gender { get; set; }
    }
}
