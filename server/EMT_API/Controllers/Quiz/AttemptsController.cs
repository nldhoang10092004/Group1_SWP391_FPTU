using EMT_API.Data;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers
{
    [ApiController]
    [Route("api/attempts")]
    [Authorize]
    public class AttemptController : ControllerBase
    {
        private readonly EMTDbContext _db;

        public AttemptController(EMTDbContext db)
        {
            _db = db;
        }
        [HttpGet]
        public async Task<IActionResult> GetAttempts()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            IQueryable<Attempt> query = _db.Attempts
                .Include(a => a.Quiz)
                .ThenInclude(q => q.Course)
                .AsNoTracking();

            if (role == "STUDENT")
            {
                query = query
                    .Where(a => a.UserID == uid
                             && a.Status.ToLower() == "submitted"
                             && a.SubmittedAt != null);
            }
            else if (role == "TEACHER")
            {
                query = query
                    .Where(a =>
                        a.Status.ToLower() == "submitted"
                        && a.SubmittedAt != null
                        && a.Quiz.Course != null
                        && a.Quiz.Course.TeacherID == uid);
            }
            else if (role == "ADMIN")
            {
                query = query
                    .Where(a =>
                        a.Status.ToLower() == "submitted"
                        && a.SubmittedAt != null
                        && a.Quiz.CourseID == null);
            }
            else
            {
                return Forbid("Role not supported");
            }

            var result = await query
                .OrderByDescending(a => a.SubmittedAt)
                .Select(a => new
                {
                    a.AttemptID,
                    a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    a.SubmittedAt,
                    a.AutoScore,
                    a.Status,
                    StudentID = a.UserID,
                    Course = a.Quiz.Course != null ? a.Quiz.Course.CourseName : null
                })
                .ToListAsync();

            return Ok(result);
        }

    }
}
