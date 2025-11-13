using EMT_API.DAOs.DashboardDAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "ADMIN")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardDAO _dao;
        public DashboardController(IDashboardDAO dao)
        {
            _dao = dao;
        }

        // Tổng quan dashboard
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var totalUsers = await _dao.GetTotalUsersAsync();
            var totalMembers = await _dao.GetActiveMembersAsync();
            var currentMonthRevenue = await _dao.GetCurrentMonthRevenueAsync();
            var activeCourses = await _dao.GetActiveCoursesAsync();

            double membershipRate = totalUsers > 0
                ? Math.Round((double)totalMembers / totalUsers * 100, 2)
                : 0;

            return Ok(new
            {
                totalUsers,
                totalMembers,
                membershipRate,
                currentMonthRevenue,
                activeCourses
            });
        }

        // Biểu đồ doanh thu 12 tháng gần nhất
        [HttpGet("revenue-trend")]
        public async Task<IActionResult> GetRevenueTrend()
        {
            var trend = await _dao.GetMonthlyRevenueTrendAsync();
            return Ok(trend.Select(t => new { t.Month, t.Revenue }));
        }

        // Top 5 khóa học
        [HttpGet("top-courses")]
        public async Task<IActionResult> GetTopCourses()
        {
            var top = await _dao.GetTopCoursesAsync();
            return Ok(top.Select(c => new { c.CourseName, c.EnrollmentCount }));
        }

        // Tỷ lệ role
        [HttpGet("role-distribution")]
        public async Task<IActionResult> GetRoleDistribution()
        {
            var data = await _dao.GetUserRoleDistributionAsync();
            return Ok(data);
        }
    }
}
