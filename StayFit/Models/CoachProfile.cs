using StayFit.Enums;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace StayFit.Models
{
    public class CoachProfile
    {
        public long Id { get; set; }
        public Specialty Specialty { get; set; }

        [MaxLength(500)]
        public string Bio { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }

        [ForeignKey("User")]
        public long UserId { get; set; }
        public User User { get; set; } = null!;
        
    }
}
