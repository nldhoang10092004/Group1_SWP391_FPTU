using EMT_API.DAOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EMT_API.Controllers.TeacherSide
{
    [ApiController]
    [Route("api/teacher/feedbacks")]
    [Authorize(Roles = "TEACHER")]
    public class TeacherFeedbackController : ControllerBase
    {
        private readonly IFeedbackDAO _feedbackDao;
        public TeacherFeedbackController(IFeedbackDAO feedbackDao) => _feedbackDao = feedbackDao;

        [HttpGet]
        public async Task<IActionResult> GetMyCourseFeedbacks()
        {
            int teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var feedbacks = await _feedbackDao.GetTeacherFeedbacksAsync(teacherId);
            return Ok(feedbacks);
        }
    }
}
