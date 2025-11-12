using EMT_API.Data;
using EMT_API.DTOs.Feedback;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/feedbacks")]
    [Authorize(Roles = "ADMIN")]
    public class AdminFeedbackController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public AdminFeedbackController(EMTDbContext db) => _db = db;

        // 1️⃣ Xem toàn bộ feedback trong hệ thống
        [HttpGet]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var data = await _db.Feedbacks
                .Include(f => f.Course)
                .Include(f => f.User)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackViewDto
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Username = f.User.Username,
                    CourseId = f.CourseId,
                    CourseName = f.Course.CourseName,
                    Rating = f.Rating,
                    Comment = f.Comment,
                    CreatedAt = f.CreatedAt,
                    IsVisible = f.IsVisible
                })
                .ToListAsync();

            return Ok(data);
        }

        // 2️⃣ Ẩn/hiện feedback (toggle visibility)
        [HttpPatch("{feedbackId:int}/toggle-visibility")]
        public async Task<IActionResult> ToggleVisibility(int feedbackId)
        {
            var feedback = await _db.Feedbacks.FindAsync(feedbackId);
            if (feedback == null)
                return NotFound(new { message = "Feedback not found." });

            feedback.IsVisible = !feedback.IsVisible;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = feedback.IsVisible ? "Feedback is now visible." : "Feedback has been hidden."
            });
        }

        // 3️⃣ Xóa feedback
        [HttpDelete("{feedbackId:int}")]
        public async Task<IActionResult> DeleteFeedback(int feedbackId)
        {
            var feedback = await _db.Feedbacks.FindAsync(feedbackId);
            if (feedback == null)
                return NotFound(new { message = "Feedback not found." });

            _db.Feedbacks.Remove(feedback);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Feedback deleted successfully." });
        }
    }
}
