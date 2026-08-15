
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StayFit.Enums;
using StayFit.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StayFit.DTOs.Register;
using StayFit.DTOs.Login;

namespace StayFit.Controllers
{
    [Route("api/Auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly StayFitDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public AuthController(StayFitDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        [HttpPost("RegisterCoach")]
        public async Task<IActionResult> RegisterCoach([FromBody] RegisterCoachDto dto, CancellationToken ct)
        {
            var email = dto.Email.Trim().ToLower();

            if (await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == email, ct))
            {
                return BadRequest("Email already exists");
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

            var user = CreateUser(dto.Name, dto.Email, dto.Password, Role.Coach);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync(ct);

            var coachProfile = new CoachProfile
            {
                UserId = user.Id,
                Specialty = dto.Specialty,
                Bio = dto.Bio ?? string.Empty,
                ExperienceYears = dto.ExperienceYears
            };

            _dbContext.CoachProfiles.Add(coachProfile);
            await _dbContext.SaveChangesAsync(ct);

            await transaction.CommitAsync();

            return Ok();

        }

        [HttpPost("RegisterClient")]
        public async Task<IActionResult> RegisterClient([FromBody] RegisterClientDto dto, CancellationToken ct)
        {
            var email = dto.Email.Trim().ToLower();

            if (await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == email, ct))
            {
                return BadRequest("Email already exists");
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

            var user = CreateUser(dto.Name, dto.Email, dto.Password, Role.Client);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync(ct);

            var client = new ClientProfile
            {
                UserId = user.Id,
                HeightCm = dto.HeightCm,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
            };

            _dbContext.ClientProfiles.Add(client);
            await _dbContext.SaveChangesAsync(ct);

            await transaction.CommitAsync();

            return Ok();

        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDto loginDto, CancellationToken ct)
        {

            if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest("Email and password are required.");
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == loginDto.Email.Trim().ToLower(), ct);

            if (user == null)
            {
                return BadRequest("Invalid email or password");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword))
            {
                return BadRequest("Invalid email or password");
            }

            var token = GenerateJwtToken(user);

            return Ok(new { Token = token });

        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);

        }

        private User CreateUser(string Name, string Email, string password, Role role)
        {
            return new User
            {
                Name = Name.Trim(),
                Email = Email.Trim().ToLower(),
                HashedPassword = BCrypt.Net.BCrypt.HashPassword(password),
                Role = role,
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}
