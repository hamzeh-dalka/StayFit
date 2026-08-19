using StayFit.Enums;

namespace StayFit.DTOs.Users
{
    public class UserDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Role Role { get; set; }
        public bool IsApproved { get; set; }
    }
}
