using EMT_API.DAOs.MembershipDAO;
using EMT_API.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMT_API.Controllers.User
{
    [ApiController]
    [Route("api/user/membership")]
    [Authorize(Roles = "STUDENT")]
    public class MembershipController : ControllerBase
    {
        private readonly IMembershipDAO _dao;

        public MembershipController(IMembershipDAO dao)
        {
            _dao = dao;
        }

        // =============================
        // 🔹 Kiểm tra membership hiện tại
        // =============================
        [HttpGet("check")]
        public async Task<ActionResult<MembershipResponseDto>> CheckMembership()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var active = await _dao.GetActiveMembershipByUserAsync(userId);
            if (active == null)
            {
                return Ok(new MembershipResponseDto
                {
                    HasMembership = false
                });
            }

            return Ok(new MembershipResponseDto
            {
                HasMembership = true,
                StartsAt = active.StartsAt,
                EndsAt = active.EndsAt,
                PlanName = active.Plan?.Name,
                Status = active.Status
            });
        }

        // =============================
        // 🔹 Lấy lịch sử membership
        // =============================
        [HttpGet("history")]
        public async Task<IActionResult> GetMembershipHistory()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var list = await _dao.GetMembershipHistoryAsync(userId);

            var result = list.Select(m => new
            {
                m.MembershipID,
                m.StartsAt,
                m.EndsAt,
                m.Status,
                PlanName = m.Plan?.Name,
                m.CreatedAt,
                m.CanceledAt
            });

            return Ok(result);
        }
    }
}
