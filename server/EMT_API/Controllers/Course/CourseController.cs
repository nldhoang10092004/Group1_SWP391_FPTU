using EMT_API.DAOs;
using EMT_API.DAOs.CourseDAO;
using EMT_API.DAOs.MembershipDAO;
using EMT_API.DTOs.Feedback; 
using EMT_API.DTOs.Public;
using EMT_API.DTOs.Feedback;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMT_API.Controllers.Public
{
    [ApiController]
    [Route("api/user/course")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseDAO _courseDao;
        private readonly IMembershipDAO _membershipDao;
        private readonly IFeedbackDAO _feedbackDao;

        public CourseController(
            ICourseDAO courseDao,
            IMembershipDAO membershipDao,
            IFeedbackDAO feedbackDao)
        {
            _courseDao = courseDao;
            _membershipDao = membershipDao;
            _feedbackDao = feedbackDao;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

            return int.Parse(idClaim);
        }

        // =========================================
        // 1️⃣ GET ALL COURSES (public)
        // =========================================
        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _courseDao.GetAllCoursesAsync();

            var result = courses.Select(course =>
            {
                // Lọc chapter có video preview
                var chapters = course.CourseChapters
                    .Select(ch => new ChapterDto
                    {
                        ChapterID = ch.ChapterID,
                        ChapterName = ch.ChapterName,
                        Videos = ch.CourseVideos
                            .Where(v => v.IsPreview)               // chỉ preview
                            .Select(v => new VideoDto
                            {
                                VideoID = v.VideoID,
                                VideoName = v.VideoName,
                                VideoURL = v.VideoURL,             // vì preview nên trả URL
                                IsPreview = true
                            })
                            .ToList()
                    })
                    .Where(ch => ch.Videos.Count > 0)             // chỉ chapter có video preview
                    .ToList();

                return new CourseDto
                {
                    CourseID = course.CourseID,
                    CourseName = course.CourseName,
                    Description = course.Description ?? "",
                    CourseLevel = course.CourseLevel,
                    TeacherID = course.TeacherID,
                    TeacherName = course.Teacher?.TeacherNavigation?.UserDetail?.FullName ?? "(Unknown)",
                    Chapters = chapters
                };
            }).ToList();

            return Ok(new { Courses = result });
        }


        // =========================================
        // 2️⃣ GET COURSE DETAIL
        // =========================================
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CourseDto>> GetCourseDetail(int id)
        {
            var course = await _courseDao.GetCourseDetailAsync(id);
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
                        VideoURL = v.IsPreview ? v.VideoURL : null,
                        IsPreview = v.IsPreview
                    }).ToList()
                }).ToList()
            };

            // Thêm Video không thuộc chapter
            var orphanVideos = course.CourseVideos
                .Where(v => v.ChapterID == null)
                .Select(v => new VideoDto
                {
                    VideoID = v.VideoID,
                    VideoName = v.VideoName,
                    VideoURL = v.IsPreview ? v.VideoURL : null,
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

        // =========================================
        // 3️⃣ GET RATING
        // =========================================
        [HttpGet("{courseId:int}/rating")]
        public async Task<IActionResult> GetCourseAverageRating(int courseId)
        {
            if (!await _courseDao.CourseExistsAsync(courseId))
                return NotFound(new { Message = "Course not found" });

            var (avg, total) = await _feedbackDao.GetCourseRatingAsync(courseId);

            return Ok(new
            {
                CourseID = courseId,
                AverageRating = avg,
                TotalFeedback = total
            });
        }

        // =========================================
        // 4️⃣ GET FEEDBACK LIST
        // =========================================
        [HttpGet("{courseId:int}/feedback")]
        public async Task<IActionResult> GetCourseFeedbacks(int courseId)
        {
            if (!await _courseDao.CourseExistsAsync(courseId))
                return NotFound(new { Message = "Course not found" });

            var feedbacks = await _feedbackDao.GetCourseFeedbacksAsync(courseId);

            return Ok(new
            {
                CourseID = courseId,
                TotalFeedback = feedbacks.Count,
                Feedbacks = feedbacks
            });
        }

        // =========================================
        // 5️⃣ USER SUBMIT FEEDBACK
        // =========================================
        [Authorize(Roles = "STUDENT")]
        [HttpPost("feedback")]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackCreateRequest req)
        {
            int userId = GetUserId();

            bool hasMembership = await _membershipDao.HasActiveMembershipAsync(userId);
            if (!hasMembership)
                return StatusCode(403, new { message = "You need an active membership to submit feedback." });

            if (!await _courseDao.CourseExistsAsync(req.CourseID))
                return NotFound(new { Message = "Course not found" });

            if (await _feedbackDao.HasFeedbackAsync(req.CourseID, userId))
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

            var created = await _feedbackDao.CreateFeedbackAsync(feedback);

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
