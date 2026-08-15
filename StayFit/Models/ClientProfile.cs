using StayFit.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class ClientProfile
    {
        public long Id { get; set; }
        public float HeightCm { get; set; } // in centimeters
        public DateOnly DateOfBirth { get; set; }
        public Gender Gender { get; set; }

        [ForeignKey("User")]
        public long UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
