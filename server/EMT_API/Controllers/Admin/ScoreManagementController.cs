using EMT_API.Data;
using EMT_API.DTOs.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace EMT_API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/score-management")]
    [Authorize(Roles = "ADMIN")]
    public class ScoreManagementController : ControllerBase
    {
        private readonly EMTDbContext _db;

        public ScoreManagementController(EMTDbContext db)
        {
            _db = db;
        }

        // ----------------------------------------------------------
        // 1️⃣ Xem điểm quiz theo giáo viên (quiz thuộc course của họ)
        // ----------------------------------------------------------
        [HttpGet("teacher/{teacherId:int}")]
        public async Task<IActionResult> GetScoresByTeacher(int teacherId)
        {
            var data = await _db.Attempts
                .Include(a => a.Quiz)
                    .ThenInclude(q => q.Course)
                .Include(a => a.User)
                .Where(a => a.Quiz.Course != null && a.Quiz.Course.TeacherID == teacherId)
                .Select(a => new ScoreViewRequest
                {
                    AttemptId = a.AttemptID,
                    QuizId = a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    CourseId = a.Quiz.CourseID,
                    CourseName = a.Quiz.Course.CourseName,
                    UserId = a.UserID,
                    UserName = a.User.Username,
                    Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                    AttemptDate = a.SubmittedAt ?? a.StartedAt
                })
                .OrderByDescending(a => a.AttemptDate)
                .ToListAsync();

            if (!data.Any())
                return NotFound(new { message = "No scores found for this teacher's courses." });

            return Ok(data);
        }

        // ----------------------------------------------------------
        // 2️⃣ Xem điểm của các bài kiểm tra toàn hệ thống (System Exam)
        // ----------------------------------------------------------
        [HttpGet("system-exams")]
        public async Task<IActionResult> GetSystemExamScores()
        {
            var data = await _db.Attempts
                .Include(a => a.Quiz)
                .Include(a => a.User)
                .Where(a => a.Quiz.CourseID == null)
                .Select(a => new ScoreViewRequest
                {
                    AttemptId = a.AttemptID,
                    QuizId = a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    CourseId = null,
                    CourseName = "System Exam",
                    UserId = a.UserID,
                    UserName = a.User.Username,
                    Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                    AttemptDate = a.SubmittedAt ?? a.StartedAt
                })
                .OrderByDescending(a => a.AttemptDate)
                .ToListAsync();

            if (!data.Any())
                return NotFound(new { message = "No scores found for system exams." });

            return Ok(data);
        }

        // ----------------------------------------------------------
        // 3️⃣ Xem điểm của một người (tách course và system exam)
        // ----------------------------------------------------------
        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetUserScoresSeparated(int userId)
        {
            var courseScores = await _db.Attempts
                .Include(a => a.Quiz)
                    .ThenInclude(q => q.Course)
                .Include(a => a.User)
                .Where(a => a.UserID == userId && a.Quiz.CourseID != null)
                .Select(a => new ScoreViewRequest
                {
                    AttemptId = a.AttemptID,
                    QuizId = a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    CourseId = a.Quiz.CourseID,
                    CourseName = a.Quiz.Course.CourseName,
                    UserId = a.UserID,
                    UserName = a.User.Username,
                    Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                    AttemptDate = a.SubmittedAt ?? a.StartedAt
                })
                .ToListAsync();

            var systemExamScores = await _db.Attempts
                .Include(a => a.Quiz)
                .Include(a => a.User)
                .Where(a => a.UserID == userId && a.Quiz.CourseID == null)
                .Select(a => new ScoreViewRequest
                {
                    AttemptId = a.AttemptID,
                    QuizId = a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    CourseId = null,
                    CourseName = "System Exam",
                    UserId = a.UserID,
                    UserName = a.User.Username,
                    Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                    AttemptDate = a.SubmittedAt ?? a.StartedAt
                })
                .ToListAsync();

            return Ok(new
            {
                CourseScores = courseScores,
                SystemExamScores = systemExamScores
            });
        }

        // ----------------------------------------------------------
        // 4️⃣ Hiển thị toàn bộ điểm theo Course (gộp tất cả quiz)
        // ----------------------------------------------------------
        [HttpGet("by-course/{courseId:int}")]
        public async Task<IActionResult> GetScoresByCourse(int courseId)
        {
            var data = await _db.Attempts
                .Include(a => a.Quiz)
                    .ThenInclude(q => q.Course)
                .Include(a => a.User)
                .Where(a => a.Quiz.CourseID == courseId)
                .Select(a => new ScoreViewRequest
                {
                    AttemptId = a.AttemptID,
                    QuizId = a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    CourseId = a.Quiz.CourseID,
                    CourseName = a.Quiz.Course.CourseName,
                    UserId = a.UserID,
                    UserName = a.User.Username,
                    Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                    AttemptDate = a.SubmittedAt ?? a.StartedAt
                })
                .OrderByDescending(a => a.AttemptDate)
                .ToListAsync();

            if (!data.Any())
                return NotFound(new { message = "No scores found for this course." });

            return Ok(data);
        }

        // ----------------------------------------------------------
        // 5️⃣ Hiển thị toàn bộ điểm của TẤT CẢ bài kiểm tra toàn hệ thống
        // ----------------------------------------------------------
        [HttpGet("system-exams/all")]
        public async Task<IActionResult> GetAllSystemExamScores()
        {
            var data = await _db.Attempts
                .Include(a => a.Quiz)
                .Include(a => a.User)
                .Where(a => a.Quiz.CourseID == null)
                .GroupBy(a => new { a.QuizID, a.Quiz.Title })
                .Select(g => new
                {
                    QuizId = g.Key.QuizID,
                    QuizTitle = g.Key.Title,
                    Attempts = g.Select(a => new ScoreViewRequest
                    {
                        AttemptId = a.AttemptID,
                        QuizId = a.QuizID,
                        QuizTitle = a.Quiz.Title,
                        CourseId = null,
                        CourseName = "System Exam",
                        UserId = a.UserID,
                        UserName = a.User.Username,
                        Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                        AttemptDate = a.SubmittedAt ?? a.StartedAt
                    }).ToList()
                })
                .ToListAsync();

            if (!data.Any())
                return NotFound(new { message = "No system exam scores found." });

            return Ok(data);
        }
    }
}