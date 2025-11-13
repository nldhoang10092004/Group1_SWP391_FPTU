using EMT_API.DAOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EMT_API.Controllers
{
    [ApiController]
    [Route("api/attempts")]
    [Authorize]
    public class AttemptController : ControllerBase
    {
        private readonly IQuizDAO _quizDao;

        public AttemptController(IQuizDAO quizDao)
        {
            _quizDao = quizDao;
        }

        [HttpGet]
        public async Task<IActionResult> GetAttempts()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var attempts = await _quizDao.GetAttemptsAsync(role, uid);

            if (attempts.Count == 0)
                return Ok(new { message = "No attempts found" });

            return Ok(attempts);
        }
    }
}
