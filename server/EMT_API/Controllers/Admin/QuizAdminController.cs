using EMT_API.Data;
using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Quiz;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/quiz")]
    [Authorize(Roles = "Admin")] // 🔒 Chỉ admin truy cập
    public class QuizAdminController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public QuizAdminController(EMTDbContext db) => _db = db;

        // ===========================================
        // 🔹 1️⃣ Lấy tất cả quiz theo course (nếu có)
        // ===========================================
        [HttpGet("course/{courseId:int}")]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            var quizzes = await _db.Quizzes
                .Where(q => q.CourseID == courseId)
                .Select(q => new QuizListResponse
                {
                    QuizID = q.QuizID,
                    Title = q.Title,
                    Description = q.Description,
                    QuizType = q.QuizType,
                    IsActive = q.IsActive
                })
                .ToListAsync();

            return Ok(quizzes);
        }

        // ===========================================
        // 🔹 2️⃣ Tạo quiz (có thể không gắn với course)
        // ===========================================
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuiz([FromBody] DTOs.Admin.CreateQuizRequest request)
        {
            var quiz = new EMT_API.Models.Quiz
            {
                Title = request.Title,
                Description = request.Description,
                QuizType = request.QuizType,
                IsActive = true,
                CourseID = (int)request.CourseID // có thể null
            };

            _db.Quizzes.Add(quiz);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Quiz created successfully", quiz.QuizID });
        }

        // ===========================================
        // 🔹 3️⃣ Cập nhật quiz
        // ===========================================
        [HttpPut("{quizId:int}")]
        public async Task<IActionResult> UpdateQuiz(int quizId, [FromBody] UpdateQuizRequest dto)
        {
            var quiz = await _db.Quizzes.FindAsync(quizId);
            if (quiz == null) return NotFound(new { message = "Quiz not found" });

            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.QuizType = dto.QuizType;
            quiz.IsActive = dto.IsActive;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Quiz updated successfully" });
        }

        // ===========================================
        // 🔹 4️⃣ Xóa quiz (phải xóa item nhỏ trước)
        // ===========================================
        [HttpDelete("{quizId:int}")]
        public async Task<IActionResult> DeleteQuiz(int quizId)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(q => q.QuizID == quizId);

            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            // Xóa sâu: Option → Question → QuestionGroup → Quiz
            if (quiz.QuestionGroups != null)
            {
                foreach (var group in quiz.QuestionGroups)
                {
                    foreach (var question in group.Questions)
                    {
                        _db.Options.RemoveRange(question.Options);
                    }
                    _db.Questions.RemoveRange(group.Questions);
                }
                _db.QuestionGroups.RemoveRange(quiz.QuestionGroups);
            }

            if (quiz.Questions != null)
            {
                foreach (var question in quiz.Questions)
                {
                    _db.Options.RemoveRange(question.Options);
                }
                _db.Questions.RemoveRange(quiz.Questions);
            }

            _db.Quizzes.Remove(quiz);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Quiz deleted successfully" });
        }

        // ===========================================
        // 🔹 5️⃣ Xem chi tiết quiz (bao gồm đáp án)
        // ===========================================
        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(q => q.QuizID == quizId);

            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            var dto = new QuizDetailResponse
            {
                QuizID = quiz.QuizID,
                Title = quiz.Title,
                Description = quiz.Description,
                QuizType = quiz.QuizType,
                CourseID = quiz.CourseID,
                Groups = quiz.QuestionGroups.Select(g => new QuestionGroupResponse
                {
                    GroupID = g.GroupID,
                    Instruction = g.Instruction,
                    Questions = g.Questions.Select(qs => new QuestionResponse
                    {
                        QuestionID = qs.QuestionID,
                        Content = qs.Content,
                        QuestionType = qs.QuestionType,
                        Options = qs.Options.Select(o => new OptionResponse
                        {
                            OptionID = o.OptionID,
                            Content = o.Content,
                            IsCorrect = o.IsCorrect
                        }).ToList()
                    }).ToList()
                }).ToList()
            };
            return Ok(dto);
        }
    }
}
