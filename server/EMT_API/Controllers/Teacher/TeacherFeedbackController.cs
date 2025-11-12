using EMT_API.Data;
using EMT_API.DTOs.Feedback;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EMT_API.Controllers.TeacherSide
{
    [ApiController]
    [Route("api/teacher/feedbacks")]
    [Authorize(Roles = "TEACHER")]
    public class TeacherFeedbackController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public TeacherFeedbackController(EMTDbContext db) => _db = db;

        // GET: Xem feedback các khóa học của giáo viên
        [HttpGet]
        public async Task<IActionResult> GetMyCourseFeedbacks()
        {
            int teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var feedbacks = await _db.Feedbacks
                .Include(f => f.Course)
                .Include(f => f.User)
                .Where(f => f.Course.TeacherID == teacherId && f.IsVisible)
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

            return Ok(feedbacks);
        }
    }
}
