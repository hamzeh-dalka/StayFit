using Microsoft.EntityFrameworkCore;
using StayFit.Enums;
using System.ComponentModel.DataAnnotations;

namespace StayFit.Models
{
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {
        public long Id { get; set; }

        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(255)]
        public string HashedPassword { get; set; } = string.Empty;
        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
