using EMT_API.Data;
using EMT_API.DTOs.Course;
using EMT_API.DTOs.Public;
using EMT_API.Models;
using EMT_API.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers.Public
{
    [ApiController]
    [Route("api/user/course")]
    public class CourseController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public CourseController(EMTDbContext db) => _db = db;

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;
            return int.Parse(idClaim);
        }
        // GET: api/user/course
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
        {
            var courses = await _db.Courses
                .Include(c => c.Teacher)
                .ThenInclude(t => t.TeacherNavigation)
                .ThenInclude(u => u.UserDetail)
                .Select(c => new CourseDto
                {
                    CourseID = c.CourseID,
                    CourseName = c.CourseName,
                    Description = c.Description ?? "",
                    CourseLevel = c.CourseLevel,
                    TeacherID = c.TeacherID,
                    TeacherName = c.Teacher.TeacherNavigation.UserDetail.FullName
                })
                .OrderBy(c => c.CourseLevel)
                .ToListAsync();

            return Ok(new { Courses = courses });
        }

        // GET: api/public/course/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CourseDto>> GetCourseDetail(int id)
        {
            var course = await _db.Courses
                .Include(c => c.Teacher)
                .ThenInclude(t => t.TeacherNavigation)
                .ThenInclude(u => u.UserDetail)
                .Where(c => c.CourseID == id)
                .Select(c => new CourseDto
                {
                    CourseID = c.CourseID,
                    CourseName = c.CourseName,
                    Description = c.Description ?? "",
                    CourseLevel = c.CourseLevel,
                    TeacherID = c.TeacherID,
                    TeacherName = c.Teacher.TeacherNavigation.UserDetail.FullName,
                    Chapters = c.CourseChapters.Select(ch => new ChapterDto
                    {
                        ChapterID = ch.ChapterID,
                        ChapterName = ch.ChapterName,
                        Videos = ch.CourseVideos.Select(v => new VideoDto
                        {
                            VideoID = v.VideoID,
                            VideoName = v.VideoName,
                            VideoURL = v.IsPreview ? v.VideoURL : null!,
                            IsPreview = v.IsPreview
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (course == null)
                return NotFound(new { Message = "Course not found" });

            return Ok(course);
        }


        [HttpGet("{courseId:int}/rating")]
        public async Task<IActionResult> GetCourseAverageRating(int courseId)
        {
            var exists = await _db.Courses.AnyAsync(c => c.CourseID == courseId);
            if (!exists)
                return NotFound(new { Message = "Course not found" });

            var ratingData = await _db.Feedbacks
                .Where(f => f.CourseId == courseId && f.IsVisible)
                .GroupBy(f => f.CourseId)
                .Select(g => new
                {
                    CourseID = g.Key,
                    AverageRating = Math.Round(g.Average(f => f.Rating), 2),
                    TotalFeedback = g.Count()
                })
                .FirstOrDefaultAsync();

            if (ratingData == null)
                return Ok(new { CourseID = courseId, AverageRating = 0, TotalFeedback = 0 });

            return Ok(ratingData);
        }

        [HttpGet("{courseId:int}/feedback")]
        public async Task<IActionResult> GetCourseFeedbacks(int courseId)
        {
            var exists = await _db.Courses.AnyAsync(c => c.CourseID == courseId);
            if (!exists)
                return NotFound(new { Message = "Course not found" });
            var feedbacks = await _db.Feedbacks
                .Where(f => f.CourseId == courseId && f.IsVisible)
                .Include(f => f.User)
                     .ThenInclude(u => u.UserDetail)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    UserName = f.User.UserDetail.FullName ?? "(Anonymous)",
                    f.Rating,
                    f.Comment,
                    f.CreatedAt
                })
                .ToListAsync();
            return Ok(new
            {
                CourseID = courseId,
                TotalFeedback = feedbacks.Count,
                Feedbacks = feedbacks
            });
        }

        [HttpPost("feedback")]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackCreateRequest req)
        {
            int userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "You must be logged in to submit feedback." });

            bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, userId);
            if (!hasMembership)
                return StatusCode(403, new { message = "You need an active membership to submit feedback." });

            var exists = await _db.Courses.AnyAsync(c => c.CourseID == req.CourseID);
            if (!exists)
                return NotFound(new { Message = "Course not found" });
            var existingFeedback = await _db.Feedbacks.FirstOrDefaultAsync(f => f.CourseId == req.CourseID && f.UserId == userId);
            if (existingFeedback != null)
            {
                return BadRequest(new { message = "You have already submitted feedback for this course." });
            }
            if (req.Rating < 1 || req.Rating > 5)
                return BadRequest(new { message = "Rating must be between 1 and 5." });

            var feedback = new Feedback
            {
                UserId = userId,
                CourseId = req.CourseID,
                Rating = req.Rating,
                Comment = req.Comment,
                CreatedAt = DateTime.UtcNow,
                IsVisible = true
            };

            _db.Feedbacks.Add(feedback);
            await _db.SaveChangesAsync();
            return Ok(new
            {
                message = "Feedback submitted successfully.",
                feedback.FeedbackId,
                feedback.Rating,
                feedback.Comment
            });
        }
    }
}
