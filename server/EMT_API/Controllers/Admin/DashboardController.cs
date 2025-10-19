using EMT_API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "ADMIN")]
    public class DashboardController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public DashboardController(EMTDbContext db) => _db = db;

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            // Tổng người dùng
            var totalUsers = await _db.Accounts.CountAsync();

            // Tổng người dùng đăng ký hội viên (còn hạn)
            var now = DateTime.UtcNow;
            var totalMembers = await _db.UserMemberships
                .Where(m => m.EndsAt >= now)
                .Select(m => m.UserID)
                .Distinct()
                .CountAsync();

            // Tỷ lệ hội viên
            double membershipRate = totalUsers > 0
                ? Math.Round((double)totalMembers / totalUsers * 100, 2)
                : 0;

            // Doanh thu tháng hiện tại
            var currentMonthRevenue = await _db.PaymentOrders
                .Where(p => p.Status == "SUCCESS"
                            && p.CreatedAt.Month == now.Month
                            && p.CreatedAt.Year == now.Year)
                .SumAsync(p => (decimal?)p.Amount ?? 0);

            // Số khóa học đang hoạt động:
            // Giả sử “đang hoạt động” nghĩa là có người dùng còn hội viên
            // (vì giáo viên vẫn có thể tạo khóa học mới)
            var activeCourses = await _db.Courses.CountAsync();

            // Kết quả trả về
            return Ok(new
            {
                totalUsers,
                totalMembers,
                membershipRate,
                currentMonthRevenue,
                activeCourses
            });
        }
    }
}
