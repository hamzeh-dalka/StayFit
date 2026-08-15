using StayFit.Enums;

namespace StayFit.DTOs.Register
{
    public class RegisterClientDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public float HeightCm { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public Gender Gender { get; set; }
    }
}
