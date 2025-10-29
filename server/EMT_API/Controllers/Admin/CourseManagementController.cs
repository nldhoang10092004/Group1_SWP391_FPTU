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

    // -----------------------------
    // 4️⃣ Xem chi tiết 1 khóa học
    // -----------------------------
    [HttpGet("detail/{courseId:int}")]
    public async Task<IActionResult> GetCourseDetail(int courseId)
    {
        var course = await _db.Courses
            .Include(c => c.Teacher)
                .ThenInclude(t => t.TeacherNavigation)
            .Include(c => c.CourseChapters)
            .Include(c => c.CourseVideos)
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
            .FirstOrDefaultAsync(c => c.CourseID == courseId);

        if (course == null)
            return NotFound(new { message = "Course not found." });

        var response = new
        {
            course.CourseID,
            course.CourseName,
            Description = course.Description,
            Teacher = course.Teacher != null && course.Teacher.TeacherNavigation != null
                ? new
                {
                    course.Teacher.TeacherID,
                    TeacherName = course.Teacher.TeacherNavigation.Username
                }
                : null,
            course.CreateAt,

            // Danh sách chương học
            Chapters = course.CourseChapters
                .Select(ch => new
                {
                    ch.ChapterID,
                    ch.ChapterName,
                    // Không có ChapterOrder, chỉ hiển thị ID theo thứ tự
                })
                .OrderBy(ch => ch.ChapterID)
                .ToList(),

            // Danh sách video
            Videos = course.CourseVideos
                .Select(v => new
                {
                    v.VideoID,
                    v.VideoName,
                    v.VideoURL,
                    v.IsPreview,
                    v.ChapterID,
                    v.CourseID,
                    v.ResourceJson
                })
                .ToList(),

            // Danh sách quiz
            Quizzes = course.Quizzes.Select(q => new
            {
                q.QuizID,
                q.Title,
                q.Description,
                q.CreatedAt,

                // Các nhóm câu hỏi
                QuestionGroups = q.QuestionGroups.Select(g => new
                {
                    g.GroupID, // ✅ đúng với model mặc định trong EF
                    Questions = g.Questions.Select(qq => new
                    {
                        qq.QuestionID,
                        qq.Content,      // ✅ đúng với model Question
                        qq.QuestionType,
                        qq.ScoreWeight,
                        Options = qq.Options.Select(o => new
                        {
                            o.OptionID,
                            o.Content,    // ✅ đúng với model Option
                            o.IsCorrect
                        })
                    })
                }),

                // Câu hỏi không thuộc nhóm
                Questions = q.Questions
                    .Where(qq => qq.GroupID == null)
                    .Select(qq => new
                    {
                        qq.QuestionID,
                        qq.Content,
                        qq.QuestionType,
                        qq.ScoreWeight,
                        Options = qq.Options.Select(o => new
                        {
                            o.OptionID,
                            o.Content,
                            o.IsCorrect
                        })
                    })
            })
        };

        return Ok(response);
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




