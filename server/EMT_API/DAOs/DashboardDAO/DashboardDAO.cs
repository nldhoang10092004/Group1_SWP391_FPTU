using EMT_API.Data;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.DAOs.DashboardDAO
{
    public class DashboardDAO : IDashboardDAO
    {
        private readonly EMTDbContext _db;
        public DashboardDAO(EMTDbContext db)
        {
            _db = db;
        }

        // ===============================
        // Tổng số người dùng
        // ===============================
        public async Task<int> GetTotalUsersAsync()
        {
            return await _db.Accounts.CountAsync();
        }

        // ===============================
        // Tổng số hội viên còn hiệu lực
        // ===============================
        public async Task<int> GetActiveMembersAsync()
        {
            var now = DateTime.UtcNow;
            return await _db.UserMemberships
                .Where(m => m.EndsAt >= now)
                .Select(m => m.UserID)
                .Distinct()
                .CountAsync();
        }

        // ===============================
        // Doanh thu tháng hiện tại
        // ===============================
        public async Task<decimal> GetCurrentMonthRevenueAsync()
        {
            var now = DateTime.UtcNow;
            return await _db.PaymentOrders
                .Where(p => p.Status == "SUCCESS"
                         && p.CreatedAt.Month == now.Month
                         && p.CreatedAt.Year == now.Year)
                .SumAsync(p => (decimal?)p.Amount ?? 0);
        }

        // ===============================
        // Tổng số khóa học
        // ===============================
        public async Task<int> GetActiveCoursesAsync()
        {
            return await _db.Courses.CountAsync();
        }

        // ===============================
        // Doanh thu 12 tháng gần nhất (biểu đồ)
        // ===============================
        public async Task<List<(string Month, decimal Revenue)>> GetMonthlyRevenueTrendAsync()
        {
            var now = DateTime.UtcNow;
            var start = now.AddMonths(-11);

            var revenue = await _db.PaymentOrders
                .Where(p => p.Status == "SUCCESS"
                         && p.CreatedAt >= new DateTime(start.Year, start.Month, 1))
                .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                .Select(g => new
                {
                    Month = $"{g.Key.Month:D2}/{g.Key.Year}",
                    Revenue = g.Sum(p => (decimal?)p.Amount ?? 0)
                })
                .OrderBy(x => x.Month)
                .ToListAsync();

            return revenue.Select(r => (r.Month, r.Revenue)).ToList();
        }

        // ===============================
        // Top 5 khóa học nhiều người học nhất
        // ===============================
        public async Task<List<(string CourseName, int EnrollmentCount)>> GetTopCoursesAsync()
        {
            return await _db.Courses
                .Include(c => c.Teacher)
                .OrderByDescending(c => c.CourseChapters.Count)
                .Take(5)
                .Select(c => new ValueTuple<string, int>(
                    c.CourseName,
                    c.CourseChapters.Count))
                .ToListAsync();
        }

        // ===============================
        // Tỷ lệ người dùng theo role
        // ===============================
        public async Task<Dictionary<string, int>> GetUserRoleDistributionAsync()
        {
            var data = await _db.Accounts
                .GroupBy(a => a.Role)
                .Select(g => new { Role = g.Key, Count = g.Count() })
                .ToListAsync();

            return data.ToDictionary(x => x.Role, x => x.Count);
        }
    }
}
