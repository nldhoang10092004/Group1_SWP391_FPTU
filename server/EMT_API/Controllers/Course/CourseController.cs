using EMT_API.DAOs;
using EMT_API.DAOs.CourseDAO;
using EMT_API.DTOs.Feedback; 
using EMT_API.DTOs.Public;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EMT_API.DAOs.MembershipDAO;

namespace EMT_API.Controllers.Public
{
    [ApiController]
    [Route("api/user/course")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseDAO _courseDao;
        private readonly IMembershipDAO _membershipDao;
        private readonly IFeedbackDAO _feedbackDao;

        public CourseController(ICourseDAO courseDao, IMembershipDAO membershipDao, IFeedbackDAO feedbackDao)
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

        // --- Rating trung bình ---
        [HttpGet("{courseId:int}/rating")]
        public async Task<IActionResult> GetCourseAverageRating(int courseId)
        {
            if (!await _courseDao.CourseExistsAsync(courseId))
                return NotFound(new { Message = "Course not found" });

            var (avg, total) = await _feedbackDao.GetCourseRatingAsync(courseId);
            return Ok(new { CourseID = courseId, AverageRating = avg, TotalFeedback = total });
        }

        // --- Danh sách feedback ---
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

        // --- Gửi feedback ---
        [HttpPost("feedback")]
        [Authorize(Roles = "STUDENT")]
        public async Task<IActionResult> CreateFeedback([FromBody] DTOs.Feedback.FeedbackCreateRequest req)
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
