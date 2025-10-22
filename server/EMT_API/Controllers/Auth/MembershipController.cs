using EMT_API.Data;
using EMT_API.DTOs.Auth;
using EMT_API.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers.User
{
    [ApiController]
    [Route("api/user/membership")]
    [Authorize(Roles = "STUDENT")]
    public class MembershipController : ControllerBase
    {
        private readonly EMTDbContext _db;

        public MembershipController(EMTDbContext db)
        {
            _db = db;
        }

        [HttpGet("check")]
        public async Task<ActionResult<MembershipResponseDto>> CheckMembership()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var membership = await _db.UserMemberships
                .Include(x => x.Plan)
                .Where(x => x.UserID == userId && x.Status == "ACTIVE")
                .OrderByDescending(x => x.EndsAt)
                .FirstOrDefaultAsync();

            if (membership == null || DateTime.UtcNow > membership.EndsAt)
            {
                return Ok(new MembershipResponseDto
                {
                    HasMembership = false
                });
            }

            return Ok(new MembershipResponseDto
            {
                HasMembership = true,
                StartsAt = membership.StartsAt,
                EndsAt = membership.EndsAt,
                PlanName = membership.Plan?.Name,
                Status = membership.Status
            });
        }
    }
}
