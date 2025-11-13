using EMT_API.Models;

namespace EMT_API.DAOs.DashboardDAO
{
    public interface IDashboardDAO
    {
        // Tổng số người dùng
        Task<int> GetTotalUsersAsync();

        // Tổng số hội viên còn hiệu lực
        Task<int> GetActiveMembersAsync();

        // Doanh thu tháng hiện tại
        Task<decimal> GetCurrentMonthRevenueAsync();

        // Số khóa học hiện có
        Task<int> GetActiveCoursesAsync();

        // Doanh thu 12 tháng gần nhất (biểu đồ)
        Task<List<(string Month, decimal Revenue)>> GetMonthlyRevenueTrendAsync();

        // Top 5 khóa học có nhiều người học nhất
        Task<List<(string CourseName, int EnrollmentCount)>> GetTopCoursesAsync();

        // Tỷ lệ user theo role (Admin/Teacher/Student)
        Task<Dictionary<string, int>> GetUserRoleDistributionAsync();
    }
}
