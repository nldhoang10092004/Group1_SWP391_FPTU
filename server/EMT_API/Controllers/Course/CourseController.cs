using EMT_API.DTOs.Course;
using EMT_API.DTOs.Public;
using EMT_API.Models;
using EMT_API.Utils;
using EMT_API.DAOs.CourseDAO;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMT_API.Controllers.Public
{
    [ApiController]
    [Route("api/user/course")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseDAO _dao;
        private readonly EMT_API.Data.EMTDbContext _db; // vẫn cần cho MembershipUtil

        public CourseController(ICourseDAO dao, EMT_API.Data.EMTDbContext db)
        {
            _dao = dao;
            _db = db;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;
            return int.Parse(idClaim);
        }

        // =============================
        // Lấy danh sách khoá học public
        // =============================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
        {
            var courses = await _dao.GetAllCoursesAsync();
            var dtos = courses.Select(c => new CourseDto
            {
                CourseID = c.CourseID,
                CourseName = c.CourseName,
                Description = c.Description ?? "",
                CourseLevel = c.CourseLevel,
                TeacherID = c.TeacherID,
                TeacherName = c.Teacher?.TeacherNavigation?.UserDetail?.FullName ?? "(Unknown)"
            }).OrderBy(c => c.CourseLevel);

            return Ok(new { Courses = dtos });
        }

        // =============================
        // Chi tiết 1 khoá học
        // =============================
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CourseDto>> GetCourseDetail(int id)
        {
            var course = await _dao.GetCourseDetailAsync(id);
            if (course == null)
                return NotFound(new { Message = "Course not found" });

            var dto = new CourseDto
            {
                CourseID = course.CourseID,
                CourseName = course.CourseName,
                Description = course.Description ?? "",
                CourseLevel = course.CourseLevel,
                TeacherID = course.TeacherID,
                TeacherName = course.Teacher?.TeacherNavigation?.UserDetail?.FullName ?? "(Unknown)",
                Chapters = course.CourseChapters.Select(ch => new ChapterDto
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
            };


            // ✅ Thêm đoạn xử lý video không thuộc chapter
            var orphanVideos = course.CourseVideos
                .Where(v => v.ChapterID == null)
                .Select(v => new VideoDto
                {
                    VideoID = v.VideoID,
                    VideoName = v.VideoName,
                    VideoURL = v.IsPreview ? v.VideoURL : null!,
                    IsPreview = v.IsPreview
                }).ToList();

            if (orphanVideos.Any())
            {
                dto.Chapters.Add(new ChapterDto
                {
                    ChapterID = 0,
                    ChapterName = "(Uncategorized Videos)",
                    Videos = orphanVideos
                });
            }

            return Ok(dto);
        }

        // =============================
        // Lấy điểm đánh giá trung bình
        // =============================
        [HttpGet("{courseId:int}/rating")]
        public async Task<IActionResult> GetCourseAverageRating(int courseId)
        {
            if (!await _dao.CourseExistsAsync(courseId))
                return NotFound(new { Message = "Course not found" });

            var (avg, total) = await _dao.GetCourseRatingAsync(courseId);
            return Ok(new { CourseID = courseId, AverageRating = avg, TotalFeedback = total });
        }

        // =============================
        // Lấy danh sách feedback
        // =============================
        [HttpGet("{courseId:int}/feedback")]
        public async Task<IActionResult> GetCourseFeedbacks(int courseId)
        {
            if (!await _dao.CourseExistsAsync(courseId))
                return NotFound(new { Message = "Course not found" });

            var feedbacks = await _dao.GetCourseFeedbacksAsync(courseId);
            var result = feedbacks.Select(f => new
            {
                UserName = f.User?.UserDetail?.FullName ?? "(Anonymous)",
                f.Rating,
                f.Comment,
                f.CreatedAt
            });

            return Ok(new
            {
                CourseID = courseId,
                TotalFeedback = feedbacks.Count,
                Feedbacks = result
            });
        }

        // =============================
        // Gửi feedback
        // =============================
        [HttpPost("feedback")]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackCreateRequest req)
        {
            int userId = GetUserId();

            bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, userId);
            if (!hasMembership)
                return StatusCode(403, new { message = "You need an active membership to submit feedback." });

            if (!await _dao.CourseExistsAsync(req.CourseID))
                return NotFound(new { Message = "Course not found" });

            if (await _dao.HasFeedbackAsync(req.CourseID, userId))
                return BadRequest(new { message = "You have already submitted feedback for this course." });

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

            var created = await _dao.CreateFeedbackAsync(feedback);
            return Ok(new
            {
                message = "Feedback submitted successfully.",
                created.FeedbackId,
                created.Rating,
                created.Comment
            });
        }
    }
}
