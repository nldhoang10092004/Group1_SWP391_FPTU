using EMT_API.DAOs;
using EMT_API.DTOs.Quiz;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EMT_API.Controllers.Quiz
{
    [ApiController]
    [Route("api/user/quiz")]
    [Authorize] // yêu cầu user có token
    public class QuizController : ControllerBase
    {
        private readonly IQuizDAO _quizDao;
        private readonly IMembershipDAO _membershipDao;

        public QuizController(IQuizDAO quizDao, IMembershipDAO membershipDao)
        {
            _quizDao = quizDao;
            _membershipDao = membershipDao;
        }

        // --------------------------------------------
        // Helper: lấy UserID từ JWT
        // --------------------------------------------
        private int GetUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
            return int.Parse(id!);
        }

        // ===========================================
        // 🔹 1️⃣ Lấy danh sách quiz theo course
        // ===========================================
        [HttpGet("course/{courseId:int}")]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            int userId = GetUserId();

            if (!await _membershipDao.HasActiveMembershipAsync(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var quizzes = await _quizDao.GetQuizzesByCourseAsync(courseId);
            return Ok(quizzes);
        }

        // ===========================================
        // 🔹 2️⃣ Lấy danh sách quiz global (system quiz)
        // ===========================================
        [HttpGet("system-quiz")]
        public async Task<IActionResult> GetGlobalQuiz()
        {
            int userId = GetUserId();

            if (!await _membershipDao.HasActiveMembershipAsync(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var quizzes = await _quizDao.GetGlobalQuizzesAsync();
            return Ok(quizzes);
        }

        // ===========================================
        // 🔹 3️⃣ Xem chi tiết quiz
        // ===========================================
        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            int userId = GetUserId();

            if (!await _membershipDao.HasActiveMembershipAsync(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var quiz = await _quizDao.GetQuizDetailAsync(quizId);
            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            return Ok(quiz);
        }

        // ===========================================
        // 🔹 4️⃣ Bắt đầu quiz (tạo attempt)
        // ===========================================
        [HttpPost("start/{quizId:int}")]
        public async Task<IActionResult> StartQuiz(int quizId)
        {
            int userId = GetUserId();

            if (!await _membershipDao.HasActiveMembershipAsync(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var attemptId = await _quizDao.StartQuizAsync(quizId, userId);
            return Ok(new { message = "Quiz started successfully", attemptId });
        }

        // ===========================================
        // 🔹 5️⃣ Nộp bài (submit)
        // ===========================================
        [HttpPost("submit/{attemptId:int}")]
        public async Task<IActionResult> SubmitQuiz(int attemptId, [FromBody] SubmitQuizRequest req)
        {
            int userId = GetUserId();

            if (!await _membershipDao.HasActiveMembershipAsync(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var score = await _quizDao.SubmitQuizAsync(attemptId, userId, req);
            if (score == null)
                return NotFound(new { message = "Attempt not found" });

            return Ok(new { message = "Quiz submitted successfully", totalScore = score });
        }

        // ===========================================
        // 🔹 6️⃣ Lịch sử làm quiz
        // ===========================================
        [HttpGet("attempts/history")]
        public async Task<IActionResult> GetAttemptHistory()
        {
            int userId = GetUserId();

            if (!await _membershipDao.HasActiveMembershipAsync(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var history = await _quizDao.GetAttemptHistoryAsync(userId);
            return Ok(history);
        }
    }
}
