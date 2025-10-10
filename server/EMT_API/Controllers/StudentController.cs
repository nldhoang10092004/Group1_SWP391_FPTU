using EMT_API.Data;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers;

[ApiController]
[Route("api/student")]
public class StudentController : ControllerBase
{
    private readonly EMTDbContext _db;

    public StudentController(EMTDbContext db)
    {
        _db = db;
    }

    // Get all available courses
    [HttpGet("courses")]
    public async Task<ActionResult> GetAllCourses()
    {
        var courses = await _db.Courses
            .Include(c => c.Teacher)
            .ThenInclude(t => t.TeacherNavigation)
            .Select(c => new
            {
                c.CourseID,
                c.CourseName,
                c.Description,
                c.CourseLevel,
                c.CreateAt,
                Teacher = new
                {
                    c.Teacher.TeacherID,
                    Name = c.Teacher.TeacherNavigation.Username
                }
            })
            .ToListAsync();

        return Ok(new { data = courses });
    }

    // Get course details with chapters and videos
    [HttpGet("courses/{courseId:int}")]
    public async Task<ActionResult> GetCourseDetails([FromRoute] int courseId)
    {
        var course = await _db.Courses
            .Include(c => c.Teacher)
            .ThenInclude(t => t.TeacherNavigation)
            .Include(c => c.CourseChapters)
            .ThenInclude(ch => ch.CourseVideos)
            .FirstOrDefaultAsync(c => c.CourseID == courseId);

        if (course == null)
            return NotFound("Course not found");

        var result = new
        {
            course.CourseID,
            course.CourseName,
            course.Description,
            course.CourseLevel,
            course.CreateAt,
            Teacher = new
            {
                course.Teacher.TeacherID,
                Name = course.Teacher.TeacherNavigation.Username,
                course.Teacher.Description
            },
            Chapters = course.CourseChapters.Select(ch => new
            {
                ch.ChapterID,
                ch.ChapterName,
                Videos = ch.CourseVideos.Select(v => new
                {
                    v.VideoID,
                    v.VideoName,
                    v.VideoURL,
                    v.IsPreview,
                    v.ResourceJson
                })
            })
        };

        return Ok(result);
    }

    // Get student dashboard data
    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard()
    {
        // For now, return mock data
        // TODO: Implement real user progress tracking
        var dashboardData = new
        {
            User = new
            {
                Name = "Demo Student",
                XP = 850,
                Streak = 5,
                Level = 3,
                Progress = 60
            },
            Stats = new
            {
                CourseProgress = new { CurrentLevel = "Level 3", XPToNext = 850 },
                Streak = new { Days = 5, Message = "Keep going!" },
                Practice = new { LessonsCompleted = 15, AverageScore = "80%" },
                TimeSpent = "this week",
                Achievements = new[]
                {
                    new { Title = "Grammar Master", Description = "Completed 10 grammar lessons", Time = "2 days ago" },
                    new { Title = "Vocabulary Builder", Description = "Learned 50 new words", Time = "3 week ago" }
                },
                WeeklyGoal = new
                {
                    Lessons = new { Completed = 5, Total = 7 },
                    StudyTime = new { Completed = 180, Total = 300, Unit = "min" }
                }
            }
        };

        return Ok(dashboardData);
    }

    // Get courses by level
    [HttpGet("courses/level/{level:int}")]
    public async Task<ActionResult> GetCoursesByLevel([FromRoute] int level)
    {
        var courses = await _db.Courses
            .Where(c => c.CourseLevel == level)
            .Include(c => c.Teacher)
            .ThenInclude(t => t.TeacherNavigation)
            .Select(c => new
            {
                c.CourseID,
                c.CourseName,
                c.Description,
                c.CourseLevel,
                c.CreateAt,
                Teacher = new
                {
                    c.Teacher.TeacherID,
                    Name = c.Teacher.TeacherNavigation.Username
                }
            })
            .ToListAsync();

        return Ok(new { data = courses });
    }
}
