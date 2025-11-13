using EMT_API.DAOs.ScoreDAO;
using EMT_API.DTOs.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/score-management")]
    [Authorize(Roles = "ADMIN")]
    public class ScoreManagementController : ControllerBase
    {
        private readonly IScoreDAO _dao;

        public ScoreManagementController(IScoreDAO dao)
        {
            _dao = dao;
        }

        //// 1️⃣ Xem điểm quiz theo giáo viên
        //[HttpGet("teacher/{teacherId:int}")]
        //public async Task<IActionResult> GetScoresByTeacher(int teacherId)
        //{
        //    var data = await _dao.GetScoresByTeacherAsync(teacherId);
        //    if (!data.Any()) return NotFound(new { message = "No scores found for this teacher's courses." });

        //    var result = data.Select(a => new ScoreViewRequest
        //    {
        //        AttemptId = a.AttemptID,
        //        QuizId = a.QuizID,
        //        QuizTitle = a.Quiz.Title,
        //        CourseId = a.Quiz.CourseID,
        //        CourseName = a.Quiz.Course?.CourseName ?? "(No Course)",
        //        UserId = a.UserID,
        //        UserName = a.User.Username,
        //        Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
        //        AttemptDate = a.SubmittedAt ?? a.StartedAt
        //    });
        //    return Ok(result);
        //}

        // 2️⃣ Điểm System Exam
        [HttpGet("system-exams")]
        public async Task<IActionResult> GetSystemExamScores()
        {
            var data = await _dao.GetSystemExamScoresAsync();
            if (!data.Any()) return NotFound(new { message = "No scores found for system exams." });

            var result = data.Select(a => new ScoreViewRequest
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
            });

            return Ok(result);
        }

        // 3️⃣ Xem điểm user (phân loại)
        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetUserScores(int userId)
        {
            var (courseScores, systemScores) = await _dao.GetUserScoresAsync(userId);

            return Ok(new
            {
                CourseScores = courseScores.Select(a => new ScoreViewRequest
                {
                    AttemptId = a.AttemptID,
                    QuizId = a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    CourseId = a.Quiz.CourseID,
                    CourseName = a.Quiz.Course?.CourseName ?? "(No Course)",
                    UserId = a.UserID,
                    UserName = a.User.Username,
                    Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                    AttemptDate = a.SubmittedAt ?? a.StartedAt
                }),
                SystemExamScores = systemScores.Select(a => new ScoreViewRequest
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
            });
        }

        // 4️⃣ Điểm theo khóa học
        [HttpGet("by-course/{courseId:int}")]
        public async Task<IActionResult> GetScoresByCourse(int courseId)
        {
            var data = await _dao.GetScoresByCourseAsync(courseId);
            if (!data.Any()) return NotFound(new { message = "No scores found for this course." });

            var result = data.Select(a => new ScoreViewRequest
            {
                AttemptId = a.AttemptID,
                QuizId = a.QuizID,
                QuizTitle = a.Quiz.Title,
                CourseId = a.Quiz.CourseID,
                CourseName = a.Quiz.Course?.CourseName ?? "(No Course)",
                UserId = a.UserID,
                UserName = a.User.Username,
                Score = (double)((a.AutoScore ?? 0) + (a.ManualScore ?? 0)),
                AttemptDate = a.SubmittedAt ?? a.StartedAt
            });

            return Ok(result);
        }

        // 5️⃣ Tất cả điểm system exam (group by quiz)
        [HttpGet("system-exams/all")]
        public async Task<IActionResult> GetAllSystemExamScores()
        {
            var grouped = await _dao.GetAllSystemExamScoresAsync();
            if (!grouped.Any()) return NotFound(new { message = "No system exam scores found." });

            var result = grouped.Select(g => new
            {
                QuizId = g.Key,
                QuizTitle = g.First().Quiz.Title,
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
            });

            return Ok(result);
        }
    }
}
