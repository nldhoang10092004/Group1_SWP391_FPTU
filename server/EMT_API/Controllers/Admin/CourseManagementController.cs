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

    [HttpDelete("delete/{courseId}")]
    public async Task<IActionResult> DeleteCourse(int courseId)
    {
        // 1️⃣ Lấy Course kèm theo toàn bộ dữ liệu liên quan
        var course = await _db.Courses
            .Include(c => c.CourseChapters)
            .Include(c => c.CourseVideos)
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
            .Include(c => c.Requests)
            .FirstOrDefaultAsync(c => c.CourseID == courseId);

        if (course == null)
            return NotFound(new { message = "Course not found." });

        // 2️⃣ Xóa các entity phụ trước để tránh lỗi ràng buộc

        // Xóa tất cả Options của Question trong Quiz
        foreach (var quiz in course.Quizzes)
        {
            foreach (var questionGroup in quiz.QuestionGroups)
            {
                _db.Options.RemoveRange(
                    questionGroup.Questions.SelectMany(q => q.Options)
                );
                _db.Questions.RemoveRange(questionGroup.Questions);
            }

            // Nếu có question không thuộc group
            _db.Options.RemoveRange(
                quiz.Questions.SelectMany(q => q.Options)
            );
            _db.Questions.RemoveRange(quiz.Questions);

            _db.QuestionGroups.RemoveRange(quiz.QuestionGroups);
        }

        // Xóa tất cả Quiz (sau khi xóa question và option)
        _db.Quizzes.RemoveRange(course.Quizzes);

        // Xóa các bảng con khác
        _db.CourseVideos.RemoveRange(course.CourseVideos);
        _db.CourseChapters.RemoveRange(course.CourseChapters);
        _db.Requests.RemoveRange(course.Requests);

        // 3️⃣ Cuối cùng, xóa Course
        _db.Courses.Remove(course);

        try
        {
            await _db.SaveChangesAsync();
            return Ok(new { message = "Course and related data deleted successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = "Error deleting course. Please check related data constraints.",
                error = ex.Message
            });
        }
    }
}




