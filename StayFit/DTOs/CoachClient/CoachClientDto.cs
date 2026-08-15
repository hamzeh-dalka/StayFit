using StayFit.Enums;

namespace StayFit.DTOs.CoachClient
{
    public class CoachClientDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public CoachClientStatus Status { get; set; }
        public DateTime RequestedAt { get; set; }
    }
}
