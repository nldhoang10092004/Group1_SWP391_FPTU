using EMT_API.Data;
using EMT_API.Models;
using EMT_API.DTOs.SystemExam;
using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Quiz;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EMT_API.DTOs.SystemExam;

namespace EMT_API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/system-exams")]
    [Authorize(Roles = "ADMIN")]
    public class SystemExamAdminController : ControllerBase
    {
        private readonly EMTDbContext _db;

        public SystemExamAdminController(EMTDbContext db)
        {
            _db = db;
        }

        // ---------------------------
        // 1️⃣ Tạo bài kiểm tra toàn hệ thống
        // ---------------------------
        
        // ---------------------------
        // 2️⃣ Xem tất cả bài kiểm tra toàn hệ thống
        // ---------------------------
        [HttpGet("view")]
        public async Task<IActionResult> GetAllSystemExams()
        {
            var data = await _db.Quizzes
                .Where(q => q.CourseID == null)
                .Select(q => new
                {
                    q.QuizID,
                    q.Title,
                    q.Description,
                    q.CreatedAt
                })
                .ToListAsync();

            return Ok(data);
        }

        // ---------------------------
        // 3️⃣ Cập nhật bài kiểm tra
        // ---------------------------
        [HttpPut("update/{quizId}")]
        public async Task<IActionResult> UpdateSystemExam(int quizId, [FromBody] UpdateSystemExamRequest request)
        {
            var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.QuizID == quizId && q.CourseID == null);
            if (quiz == null)
                return NotFound(new { message = "System exam not found." });

            quiz.Title = request.Title;
            quiz.Description = request.Description;
            await _db.SaveChangesAsync();

            return Ok(new { message = "System exam updated successfully." });
        }

        // ---------------------------
        // 4️⃣ Xóa bài kiểm tra toàn hệ thống
        // ---------------------------
        [HttpDelete("delete/{quizId}")]
        public async Task<IActionResult> DeleteSystemExam(int quizId)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .Include(q => q.Attempts)
                    .ThenInclude(a => a.Answers)
                .FirstOrDefaultAsync(q => q.QuizID == quizId && q.CourseID == null);

            if (quiz == null)
                return NotFound(new { message = "System exam not found." });

            // Xóa dữ liệu con trước để tránh lỗi ràng buộc
            foreach (var attempt in quiz.Attempts)
            {
                _db.Answers.RemoveRange(attempt.Answers);
            }
            _db.Attempts.RemoveRange(quiz.Attempts);

            foreach (var group in quiz.QuestionGroups)
            {
                foreach (var question in group.Questions)
                    _db.Options.RemoveRange(question.Options);

                _db.Questions.RemoveRange(group.Questions);
            }
            _db.QuestionGroups.RemoveRange(quiz.QuestionGroups);

            foreach (var question in quiz.Questions)
                _db.Options.RemoveRange(question.Options);
            _db.Questions.RemoveRange(quiz.Questions);

            _db.Quizzes.Remove(quiz);
            await _db.SaveChangesAsync();

            return Ok(new { message = "System-wide exam deleted successfully." });
        }
    }
}
