using EMT_API.Data;
using EMT_API.DTOs.Quiz;
using EMT_API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers.Quiz
{
    [ApiController]
    [Route("api/user/quiz")]
    [Authorize] // yêu cầu user có token
    public class QuizController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public QuizController(EMTDbContext db) => _db = db;

        // ===========================================
        // 🔹 Helper: lấy UserID từ JWT token
        // ===========================================
        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(idClaim))
                throw new UnauthorizedAccessException("Missing user claim");

            return int.Parse(idClaim);
        }

        private async Task<bool> CheckMembership(int userId)
        {
            return await MembershipUtil.HasActiveMembershipAsync(_db, userId);
        }

        // ===========================================
        // 🔹 1️⃣ Lấy danh sách quiz theo course
        // ===========================================
        [HttpGet("course/{courseId:int}")]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            int userId = GetUserId();
            if (!await CheckMembership(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var quizzes = await _db.Quizzes
                .Where(q => q.CourseID == courseId && q.IsActive)
                .Select(q => new QuizDto
                {
                    QuizID = q.QuizID,
                    Title = q.Title,
                    Description = q.Description,
                    QuizType = q.QuizType
                })
                .ToListAsync();

            return Ok(quizzes);
        }

        // ===========================================
        // 🔹 2️⃣ Lấy chi tiết quiz (hybrid mode)
        // ===========================================
        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            int userId = GetUserId();
            if (!await CheckMembership(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(q => q.QuizID == quizId);

            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            var dto = new QuizDetailDto
            {
                QuizID = quiz.QuizID,
                Title = quiz.Title,
                Description = quiz.Description,
                Groups = new List<QuestionGroupDto>()
            };

            // Nếu có group thật → load theo group
            if (quiz.QuestionGroups != null && quiz.QuestionGroups.Any())
            {
                dto.Groups = quiz.QuestionGroups.Select(g => new QuestionGroupDto
                {
                    GroupID = g.GroupID,
                    Instruction = g.Instruction,
                    Questions = g.Questions.Select(qs => new QuestionDto
                    {
                        QuestionID = qs.QuestionID,
                        Content = qs.Content,
                        QuestionType = qs.QuestionType,
                        Options = qs.Options.Select(o => new OptionDto
                        {
                            OptionID = o.OptionID,
                            Content = o.Content
                        }).ToList()
                    }).ToList()
                }).ToList();
            }
            else
            {
                // Không có group → group ảo
                var questions = quiz.Questions
                    .OrderBy(q => q.QuestionOrder)
                    .Select(qs => new QuestionDto
                    {
                        QuestionID = qs.QuestionID,
                        Content = qs.Content,
                        QuestionType = qs.QuestionType,
                        Options = qs.Options.Select(o => new OptionDto
                        {
                            OptionID = o.OptionID,
                            Content = o.Content
                        }).ToList()
                    }).ToList();

                dto.Groups.Add(new QuestionGroupDto
                {
                    GroupID = 0,
                    Instruction = "Lựa chọn đáp án đúng",
                    Questions = questions
                });
            }

            return Ok(dto);
        }

        // ===========================================
        // 🔹 3️⃣ Bắt đầu quiz (tạo Attempt)
        // ===========================================
        [HttpPost("start/{quizId:int}")]
        public async Task<IActionResult> StartQuiz(int quizId)
        {
            int userId = GetUserId();
            if (!await CheckMembership(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.QuizID == quizId && q.IsActive);
            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            var attempt = new EMT_API.Models.Attempt
            {
                QuizID = quizId,
                UserID = userId,
                Status = "IN_PROGRESS"
            };

            _db.Attempts.Add(attempt);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Quiz started successfully",
                attemptId = attempt.AttemptID,
                startedAt = attempt.StartedAt
            });
        }

        // ===========================================
        // 🔹 4️⃣ Nộp bài (Submit quiz)
        // ===========================================
        [HttpPost("submit/{attemptId:int}")]
        public async Task<IActionResult> SubmitQuiz(int attemptId, [FromBody] SubmitQuizRequest request)
        {
            int userId = GetUserId();
            if (!await CheckMembership(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var attempt = await _db.Attempts
                .Include(a => a.Quiz)
                .FirstOrDefaultAsync(a => a.AttemptID == attemptId && a.UserID == userId);

            if (attempt == null)
                return NotFound(new { message = "Attempt not found" });

            if (attempt.Status == "SUBMITTED")
                return BadRequest(new { message = "Attempt already submitted." });

            decimal totalScore = 0, maxScore = 0;

            foreach (var ans in request.Answers)
            {
                var question = await _db.Questions
                    .Include(q => q.Options)
                    .FirstOrDefaultAsync(q => q.QuestionID == ans.QuestionID);

                if (question == null) continue;

                var answer = new EMT_API.Models.Answer
                {
                    AttemptID = attemptId,
                    QuestionID = question.QuestionID,
                    AnswerText = ans.AnswerText,
                    OptionID = ans.OptionID,
                    AnsweredAt = DateTime.UtcNow
                };

                // Auto grading cho MCQ
                if (question.QuestionType == 1 && ans.OptionID.HasValue)
                {
                    bool isCorrect = question.Options.Any(o => o.OptionID == ans.OptionID && o.IsCorrect);
                    answer.GradedScore = isCorrect ? question.ScoreWeight : 0;
                    totalScore += answer.GradedScore ?? 0;
                    maxScore += question.ScoreWeight;
                }

                _db.Answers.Add(answer);
            }

            attempt.SubmittedAt = DateTime.UtcNow;
            attempt.Status = "SUBMITTED";
            attempt.AutoScore = maxScore > 0 ? Math.Round(totalScore / maxScore * 100, 2) : (decimal?)null;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Quiz submitted successfully",
                totalScore = attempt.AutoScore
            });
        }

        // ===========================================
        // 🔹 5️⃣ Xem lịch sử làm quiz
        // ===========================================
        [HttpGet("attempts/history")]
        public async Task<IActionResult> GetAttemptHistory()
        {
            int userId = GetUserId();
            if (!await CheckMembership(userId))
                return StatusCode(403, new { message = "Your membership has expired or is inactive." });

            var history = await _db.Attempts
                .Include(a => a.Quiz)
                .Where(a => a.UserID == userId)
                .OrderByDescending(a => a.StartedAt)
                .Select(a => new
                {
                    a.AttemptID,
                    a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    a.StartedAt,
                    a.SubmittedAt,
                    a.Status,
                    a.AutoScore
                })
                .ToListAsync();

            return Ok(history);
        }
    }
}
