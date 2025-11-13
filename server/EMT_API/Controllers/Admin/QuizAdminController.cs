using EMT_API.DAOs;
using EMT_API.DTOs.Quiz;
using EMT_API.DTOs.TeacherQuiz;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/quiz")]
    [Authorize(Roles = "ADMIN")]
    public class QuizAdminController : ControllerBase
    {
        private readonly IQuizDAO _quizDao;

        public QuizAdminController(IQuizDAO quizDao)
        {
            _quizDao = quizDao;
        }

        // =====================================================
        // 🔹 1️⃣ Lấy danh sách quiz global (CourseID = null)
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAllGlobalQuizzes()
        {
            var quizzes = await _quizDao.GetAllGlobalQuizzesAsync();
            return Ok(quizzes);
        }

        // =====================================================
        // 🔹 2️⃣ Lấy chi tiết quiz global
        // =====================================================
        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            var quiz = await _quizDao.GetGlobalQuizDetailAsync(quizId);
            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            return Ok(quiz);
        }

        // =====================================================
        // 🔹 3️⃣ Tạo quiz global (CourseID = null)
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> CreateGlobalQuiz([FromBody] TeacherCreateQuizRequest req)
        {
            var quizId = await _quizDao.CreateGlobalQuizAsync(req.Title, req.Description, req.QuizType);
            return Ok(new { message = "Global quiz created successfully", quizId });
        }

        // =====================================================
        // 🔹 4️⃣ Cập nhật quiz global
        // =====================================================
        [HttpPut("{quizId:int}")]
        public async Task<IActionResult> UpdateGlobalQuiz(int quizId, [FromBody] UpdateQuizRequest req)
        {
            var ok = await _quizDao.UpdateGlobalQuizAsync(quizId, req);
            return ok
                ? Ok(new { message = "Quiz updated successfully" })
                : NotFound(new { message = "Quiz not found" });
        }

        // =====================================================
        // 🔹 5️⃣ Xoá quiz global
        // =====================================================
        [HttpDelete("{quizId:int}")]
        public async Task<IActionResult> DeleteGlobalQuiz(int quizId)
        {
            var ok = await _quizDao.DeleteGlobalQuizAsync(quizId);
            return ok
                ? Ok(new { message = "Global quiz deleted successfully" })
                : NotFound(new { message = "Quiz not found" });
        }
    }
}
