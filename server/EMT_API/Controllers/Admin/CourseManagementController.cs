using EMT_API.Data;
using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Public;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.Admin;
[ApiController]
[Route("api/admin/courses")]
[Authorize(Roles = "ADMIN")]
public class CourseManagementController : ControllerBase
{
    private readonly EMTDbContext _db;

    public CourseManagementController(EMTDbContext db) => _db = db;

    // -----------------------------
    // 2️⃣ Xem tất cả khóa học
    // -----------------------------
    [HttpGet("view")]
    public async Task<IActionResult> GetAllCourses()
    {
        var data = await _db.Courses
            .Include(c => c.Teacher)
            .ThenInclude(t => t.TeacherNavigation) // liên kết sang Account để lấy tên giáo viên
            .Select(c => new CourseViewResponse
            {
                CourseID = c.CourseID,
                CourseName = c.CourseName,
                CourseDescription = c.Description,
                TeacherID = c.TeacherID,
                TeacherName = c.Teacher != null && c.Teacher.TeacherNavigation != null
                    ? c.Teacher.TeacherNavigation.Username
                    : "(No Teacher)",
                CreateAt = c.CreateAt
            })
            .ToListAsync();

        return Ok(data);
    }

    // -----------------------------
    // 3️⃣ Xem khóa học theo TeacherID
    // -----------------------------
    [HttpGet("view/{teacherId:int}")]
    public async Task<IActionResult> GetCoursesByTeacher(int teacherId)
    {
        var teacher = await _db.Teachers
            .Include(t => t.TeacherNavigation)
            .FirstOrDefaultAsync(t => t.TeacherID == teacherId);

        if (teacher == null)
            return NotFound(new { message = "Teacher not found." });

        var data = await _db.Courses
            .Where(c => c.TeacherID == teacherId)
            .Select(c => new CourseViewResponse
            {
                CourseID = c.CourseID,
                CourseName = c.CourseName,
                CourseDescription = c.Description,
                TeacherID = c.TeacherID,
                TeacherName = teacher.TeacherNavigation.Username,
                CreateAt = c.CreateAt
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpDelete("{courseId}")]
    public async Task<IActionResult> DeleteCourse(int courseId)
    {
        var course = await _db.Courses
            .Include(c => c.CourseChapters)
                .ThenInclude(ch => ch.CourseVideos)
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.QuestionGroups)
                    .ThenInclude(qg => qg.Questions)
                        .ThenInclude(qs => qs.Options)
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.Attempts)
                    .ThenInclude(a => a.Answers)
            .FirstOrDefaultAsync(c => c.CourseID == courseId);

        if (course == null)
            return NotFound(new { message = "Course not found." });

        // Xóa các phần con
        foreach (var quiz in course.Quizzes.ToList())
        {
            // Xóa Answers trong Attempt
            foreach (var attempt in quiz.Attempts.ToList())
            {
                _db.Answers.RemoveRange(attempt.Answers);
            }

            // Xóa Attempt
            _db.Attempts.RemoveRange(quiz.Attempts);

            // Xóa Option, Question, QuestionGroup
            foreach (var group in quiz.QuestionGroups.ToList())
            {
                foreach (var question in group.Questions.ToList())
                {
                    _db.Options.RemoveRange(question.Options);
                }
                _db.Questions.RemoveRange(group.Questions);
            }
            _db.QuestionGroups.RemoveRange(quiz.QuestionGroups);

            // Xóa Quiz
            _db.Quizzes.Remove(quiz);
        }

        // Xóa video trong chapter
        foreach (var chapter in course.CourseChapters.ToList())
        {
            _db.CourseVideos.RemoveRange(chapter.CourseVideos);
        }

        // Xóa chapter
        _db.CourseChapters.RemoveRange(course.CourseChapters);

        // Cuối cùng xóa course
        _db.Courses.Remove(course);

        await _db.SaveChangesAsync();

        return Ok();
    }
}




