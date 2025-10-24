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
        [HttpPost("Create")]
        public async Task<IActionResult> CreateSystemExam([FromBody] CreateSystemExamRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest("Exam title is required.");

            // Nếu CourseID hiện vẫn đang NOT NULL, ta tạm gán CourseID = 1 hoặc một ID course mặc định
            var quiz = new Models.Quiz
            {
                CourseID = null, // 👈 nếu bạn đã mở NULL thì có thể để CourseID = null
                Title = request.Title,
                Description = request.Description,
                QuizType = 1, // 1 = System Exam
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Quizzes.Add(quiz);
            await _db.SaveChangesAsync();

            // Nếu có nhóm câu hỏi
            if (request.Groups != null && request.Groups.Any())
            {
                foreach (var groupReq in request.Groups)
                {
                    var group = new QuestionGroup
                    {
                        QuizID = quiz.QuizID
                        // Không có GroupName/GroupDescription nên chỉ lưu QuizID
                    };

                    _db.QuestionGroups.Add(group);
                    await _db.SaveChangesAsync();

                    if (groupReq.Questions != null && groupReq.Questions.Any())
                    {
                        foreach (var q in groupReq.Questions)
                        {
                            var question = new Question
                            {
                                QuizID = quiz.QuizID,
                                GroupID = group.GroupID,
                                QuestionType = q.QuestionType,
                                Content = q.Content,
                                ScoreWeight = q.ScoreWeight,
                                QuestionOrder = q.QuestionOrder
                            };
                            _db.Questions.Add(question);
                        }
                    }
                }
            }
            else if (request.Questions != null && request.Questions.Any())
            {
                // Nếu không có nhóm thì tạo trực tiếp câu hỏi
                foreach (var q in request.Questions)
                {
                    var question = new Question
                    {
                        QuizID = quiz.QuizID,
                        GroupID = null,
                        QuestionType = q.QuestionType,
                        Content = q.Content,
                        ScoreWeight = q.ScoreWeight,
                        QuestionOrder = q.QuestionOrder
                    };
                    _db.Questions.Add(question);
                }
            }

            await _db.SaveChangesAsync();

            return Ok(new { message = "System exam created successfully", quizId = quiz.QuizID });
        }
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
