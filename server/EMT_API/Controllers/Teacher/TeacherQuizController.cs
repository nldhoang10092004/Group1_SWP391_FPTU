using EMT_API.DAOs;
using EMT_API.DTOs.Quiz;
using EMT_API.DTOs.TeacherQuiz;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EMT_API.Controllers.TeacherSide
{
    [ApiController]
    [Route("api/teacher/quiz")]
    [Authorize(Roles = "TEACHER")]
    public class TeacherQuizController : ControllerBase
    {
        private readonly IQuizDAO _quizDao;

        public TeacherQuizController(IQuizDAO quizDao)
        {
            _quizDao = quizDao;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // =====================================================
        // 🔹 1️⃣ Lấy danh sách quiz theo course
        // =====================================================
        [HttpGet("course/{courseId:int}")]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            var teacherId = GetUserId();

            if (!await _quizDao.TeacherOwnsCourseAsync(teacherId, courseId))
                return Forbid();

            var quizzes = await _quizDao.GetQuizzesByCourseAsync(courseId);
            return Ok(quizzes);
        }

        // =====================================================
        // 🔹 2️⃣ Lấy chi tiết quiz
        // =====================================================
        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            var teacherId = GetUserId();

            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var quiz = await _quizDao.GetQuizDetailAsync(quizId);
            if (quiz == null) return NotFound(new { message = "Quiz not found" });

            return Ok(quiz);
        }

        // =====================================================
        // 🔹 3️⃣ Tạo quiz mới trong course của giáo viên
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> CreateQuiz([FromBody] TeacherCreateQuizRequest req)
        {
            var teacherId = GetUserId();

            if (!await _quizDao.TeacherOwnsCourseAsync(teacherId, req.CourseID))
                return Forbid();

            var quizId = await _quizDao.CreateQuizAsync(req.CourseID, req.Title, req.Description, req.QuizType);
            return Ok(new { message = "Quiz created successfully", quizId });
        }

        // =====================================================
        // 🔹 4️⃣ Cập nhật quiz
        // =====================================================
        [HttpPut("{quizId:int}")]
        public async Task<IActionResult> UpdateQuiz(int quizId, [FromBody] TeacherUpdateQuizRequest req)
        {
            var teacherId = GetUserId();

            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var ok = await _quizDao.UpdateQuizAsync(quizId, req.Title, req.Description, req.QuizType, req.IsActive);
            return ok ? Ok(new { message = "Quiz updated successfully" }) : NotFound(new { message = "Quiz not found" });
        }

        // =====================================================
        // 🔹 5️⃣ Xoá quiz
        // =====================================================
        [HttpDelete("{quizId:int}")]
        public async Task<IActionResult> DeleteQuiz(int quizId)
        {
            var teacherId = GetUserId();

            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var ok = await _quizDao.DeleteQuizAsync(quizId);
            return ok ? Ok(new { message = "Quiz deleted successfully" }) : NotFound();
        }

        // =====================================================
        // 🔹 6️⃣ Import nội dung quiz
        // =====================================================
        [HttpPost("{quizId:int}/import")]
        public async Task<IActionResult> ImportQuiz(int quizId, [FromBody] ImportQuizRequest req)
        {
            var teacherId = GetUserId();

            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var ok = await _quizDao.ImportQuizAsync(quizId, req);
            return ok
                ? Ok(new { message = "Quiz imported successfully" })
                : StatusCode(500, new { message = "Import failed" });
        }
    }
}
