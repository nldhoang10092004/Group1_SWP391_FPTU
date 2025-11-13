using EMT_API.DAOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/feedbacks")]
    [Authorize(Roles = "ADMIN")]
    public class AdminFeedbackController : ControllerBase
    {
        private readonly IFeedbackDAO _feedbackDao;
        public AdminFeedbackController(IFeedbackDAO feedbackDao) => _feedbackDao = feedbackDao;

        [HttpGet]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var data = await _feedbackDao.GetAllFeedbacksAsync();
            return Ok(data);
        }

        [HttpPatch("{feedbackId:int}/toggle-visibility")]
        public async Task<IActionResult> ToggleVisibility(int feedbackId)
        {
            var ok = await _feedbackDao.ToggleVisibilityAsync(feedbackId);
            return ok
                ? Ok(new { message = "Feedback visibility updated." })
                : NotFound(new { message = "Feedback not found." });
        }

        [HttpDelete("{feedbackId:int}")]
        public async Task<IActionResult> DeleteFeedback(int feedbackId)
        {
            var ok = await _feedbackDao.DeleteFeedbackAsync(feedbackId);
            return ok
                ? Ok(new { message = "Feedback deleted successfully." })
                : NotFound(new { message = "Feedback not found." });
        }
    }
}
