using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayFit.DTOs.WeightLogs;
using StayFit.Models;

namespace StayFit.Controllers
{
    [Authorize(Roles = "Client")]
    [Route("api/weight-logs")]
    [ApiController]
    public class WeightLogsController : BaseApiController
    {
        public WeightLogsController(StayFitDbContext dbContext) : base(dbContext)
        {
        }

        [HttpGet]
        public async Task<IActionResult> GetMyWeightLogs([FromQuery] FilterWeightLogs filter, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var query = DbContext.WeightLogs.Where(w => w.ClientProfileId == clientProfile.Id);

            if (filter.FromDate.HasValue)
            {
                query = query.Where(w => w.RecordedAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(w => w.RecordedAt <= filter.ToDate.Value);
            }

            var logs = await query
                .OrderByDescending(w => w.RecordedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(w => new WeightLogDto
                {
                    Id = w.Id,
                    WeightKg = w.WeightKg,
                    RecordedAt = w.RecordedAt
                })
                .ToListAsync(ct);

            return Ok(logs);
        }

        [HttpPost]
        public async Task<IActionResult> CreateWeightLog([FromBody] SaveWeightLogDto dto, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var weightLog = new WeightLog
            {
                ClientProfileId = clientProfile.Id,
                WeightKg = dto.WeightKg,
                RecordedAt = dto.RecordedAt
            };

            DbContext.WeightLogs.Add(weightLog);
            await DbContext.SaveChangesAsync(ct);

            return Ok(new WeightLogDto
            {
                Id = weightLog.Id,
                WeightKg = weightLog.WeightKg,
                RecordedAt = weightLog.RecordedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWeightLog(long id, CancellationToken ct)
        {
            var clientProfile = await GetCurrentClientProfileAsync(ct);
            if (clientProfile == null)
            {
                return NotFound("Client profile not found.");
            }

            var weightLog = await DbContext.WeightLogs.FirstOrDefaultAsync(w => w.Id == id, ct);

            if (weightLog == null)
            {
                return NotFound();
            }

            if (weightLog.ClientProfileId != clientProfile.Id)
            {
                return Forbid();
            }

            DbContext.WeightLogs.Remove(weightLog);
            await DbContext.SaveChangesAsync(ct);

            return Ok();
        }
    }
}