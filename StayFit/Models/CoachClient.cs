using StayFit.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayFit.Models
{
    public class CoachClient
    {
        public long Id { get; set; }
        public CoachClientStatus Status { get; set; }
        public DateTime RequestedAt { get; set; }

        [ForeignKey("ClientProfile")]
        public long ClientProfileId { get; set; }
        public ClientProfile ClientProfile { get; set; } = null!;
        
        [ForeignKey("CoachProfile")]
        public long CoachProfileId { get; set; }
        public CoachProfile CoachProfile { get; set; } = null!;
    }
}
