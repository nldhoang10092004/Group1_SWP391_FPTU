using EMT_API.Data;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers;

[ApiController]
[Route("api/teacher")]
public class TeacherController : ControllerBase
{
    private readonly EMTDbContext _db;

    public TeacherController(EMTDbContext db)
    {
        _db = db;
    }

    // Get teacher's own courses
    [HttpGet("{teacherId:int}/courses")]
    public async Task<ActionResult> GetTeacherCourses([FromRoute] int teacherId)
    {
        var teacher = await _db.Teachers.FindAsync(teacherId);
        if (teacher == null)
            return NotFound("Teacher not found");

        var courses = await _db.Courses
            .Where(c => c.TeacherID == teacherId)
            .Include(c => c.CourseChapters)
            .ThenInclude(ch => ch.CourseVideos)
            .Select(c => new
            {
                c.CourseID,
                c.CourseName,
                c.Description,
                c.CourseLevel,
                c.CreateAt,
                ChapterCount = c.CourseChapters.Count,
                VideoCount = c.CourseVideos.Count
            })
            .ToListAsync();

        return Ok(new { data = courses });
    }

    // Get teacher dashboard
    [HttpGet("{teacherId:int}/dashboard")]
    public async Task<ActionResult> GetTeacherDashboard([FromRoute] int teacherId)
    {
        var teacher = await _db.Teachers
            .Include(t => t.TeacherNavigation)
            .FirstOrDefaultAsync(t => t.TeacherID == teacherId);

        if (teacher == null)
            return NotFound("Teacher not found");

        var courses = await _db.Courses
            .Where(c => c.TeacherID == teacherId)
            .Include(c => c.CourseChapters)
            .Include(c => c.CourseVideos)
            .ToListAsync();

        var totalChapters = courses.Sum(c => c.CourseChapters.Count);
        var totalVideos = courses.Sum(c => c.CourseVideos.Count);

        var dashboard = new
        {
            Teacher = new
            {
                teacher.TeacherID,
                Name = teacher.TeacherNavigation.Username,
                Email = teacher.TeacherNavigation.Email,
                teacher.Description,
                teacher.JoinAt
            },
            Stats = new
            {
                TotalCourses = courses.Count,
                TotalChapters = totalChapters,
                TotalVideos = totalVideos,
                TotalStudents = 0 // TODO: Implement when enrollment is added
            },
            RecentCourses = courses
                .OrderByDescending(c => c.CreateAt)
                .Take(5)
                .Select(c => new
                {
                    c.CourseID,
                    c.CourseName,
                    c.CourseLevel,
                    c.CreateAt
                })
        };

        return Ok(dashboard);
    }

    // Create a new course
    [HttpPost("{teacherId:int}/courses")]
    public async Task<ActionResult> CreateCourse([FromRoute] int teacherId, [FromBody] CreateCourseRequest req)
    {
        var teacher = await _db.Teachers.FindAsync(teacherId);
        if (teacher == null)
            return NotFound("Teacher not found");

        // Check if course level already exists
        var existingCourse = await _db.Courses.FirstOrDefaultAsync(c => c.CourseLevel == req.CourseLevel);
        if (existingCourse != null)
            return Conflict($"A course with level {req.CourseLevel} already exists");

        var course = new Course
        {
            TeacherID = teacherId,
            CourseName = req.CourseName,
            Description = req.Description,
            CourseLevel = req.CourseLevel,
            CreateAt = DateTime.UtcNow
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(CreateCourse), new { teacherId, courseId = course.CourseID }, new
        {
            course.CourseID,
            course.CourseName,
            course.Description,
            course.CourseLevel,
            course.CreateAt
        });
    }

    // Update a course
    [HttpPut("{teacherId:int}/courses/{courseId:int}")]
    public async Task<ActionResult> UpdateCourse([FromRoute] int teacherId, [FromRoute] int courseId, [FromBody] UpdateCourseRequest req)
    {
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.CourseID == courseId && c.TeacherID == teacherId);
        if (course == null)
            return NotFound("Course not found or you don't have permission");

        if (!string.IsNullOrWhiteSpace(req.CourseName))
            course.CourseName = req.CourseName;
        
        if (!string.IsNullOrWhiteSpace(req.Description))
            course.Description = req.Description;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Course updated successfully" });
    }

    // Delete a course
    [HttpDelete("{teacherId:int}/courses/{courseId:int}")]
    public async Task<ActionResult> DeleteCourse([FromRoute] int teacherId, [FromRoute] int courseId)
    {
        var course = await _db.Courses
            .Include(c => c.CourseChapters)
            .ThenInclude(ch => ch.CourseVideos)
            .FirstOrDefaultAsync(c => c.CourseID == courseId && c.TeacherID == teacherId);

        if (course == null)
            return NotFound("Course not found or you don't have permission");

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Course deleted successfully" });
    }

    // Add a chapter to a course
    [HttpPost("{teacherId:int}/courses/{courseId:int}/chapters")]
    public async Task<ActionResult> AddChapter([FromRoute] int teacherId, [FromRoute] int courseId, [FromBody] CreateChapterRequest req)
    {
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.CourseID == courseId && c.TeacherID == teacherId);
        if (course == null)
            return NotFound("Course not found or you don't have permission");

        var chapter = new CourseChapter
        {
            CourseID = courseId,
            ChapterName = req.ChapterName
        };

        _db.CourseChapters.Add(chapter);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(AddChapter), new { teacherId, courseId, chapterId = chapter.ChapterID }, new
        {
            chapter.ChapterID,
            chapter.ChapterName,
            chapter.CourseID
        });
    }

    // Update a chapter
    [HttpPut("{teacherId:int}/courses/{courseId:int}/chapters/{chapterId:int}")]
    public async Task<ActionResult> UpdateChapter([FromRoute] int teacherId, [FromRoute] int courseId, [FromRoute] int chapterId, [FromBody] UpdateChapterRequest req)
    {
        var chapter = await _db.CourseChapters
            .Include(ch => ch.Course)
            .FirstOrDefaultAsync(ch => ch.ChapterID == chapterId && ch.CourseID == courseId && ch.Course.TeacherID == teacherId);

        if (chapter == null)
            return NotFound("Chapter not found or you don't have permission");

        if (!string.IsNullOrWhiteSpace(req.ChapterName))
            chapter.ChapterName = req.ChapterName;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Chapter updated successfully" });
    }

    // Delete a chapter
    [HttpDelete("{teacherId:int}/courses/{courseId:int}/chapters/{chapterId:int}")]
    public async Task<ActionResult> DeleteChapter([FromRoute] int teacherId, [FromRoute] int courseId, [FromRoute] int chapterId)
    {
        var chapter = await _db.CourseChapters
            .Include(ch => ch.Course)
            .Include(ch => ch.CourseVideos)
            .FirstOrDefaultAsync(ch => ch.ChapterID == chapterId && ch.CourseID == courseId && ch.Course.TeacherID == teacherId);

        if (chapter == null)
            return NotFound("Chapter not found or you don't have permission");

        _db.CourseChapters.Remove(chapter);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Chapter deleted successfully" });
    }

    // Add a video to a chapter
    [HttpPost("{teacherId:int}/courses/{courseId:int}/chapters/{chapterId:int}/videos")]
    public async Task<ActionResult> AddVideo([FromRoute] int teacherId, [FromRoute] int courseId, [FromRoute] int chapterId, [FromBody] CreateVideoRequest req)
    {
        var chapter = await _db.CourseChapters
            .Include(ch => ch.Course)
            .FirstOrDefaultAsync(ch => ch.ChapterID == chapterId && ch.CourseID == courseId && ch.Course.TeacherID == teacherId);

        if (chapter == null)
            return NotFound("Chapter not found or you don't have permission");

        var video = new CourseVideo
        {
            ChapterID = chapterId,
            CourseID = courseId,
            VideoName = req.VideoName,
            VideoURL = req.VideoURL,
            IsPreview = req.IsPreview,
            ResourceJson = req.ResourceJson
        };

        _db.CourseVideos.Add(video);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(AddVideo), new { teacherId, courseId, chapterId, videoId = video.VideoID }, new
        {
            video.VideoID,
            video.VideoName,
            video.VideoURL,
            video.IsPreview,
            video.ResourceJson
        });
    }

    // Update a video
    [HttpPut("{teacherId:int}/courses/{courseId:int}/videos/{videoId:int}")]
    public async Task<ActionResult> UpdateVideo([FromRoute] int teacherId, [FromRoute] int courseId, [FromRoute] int videoId, [FromBody] UpdateVideoRequest req)
    {
        var video = await _db.CourseVideos
            .Include(v => v.Course)
            .FirstOrDefaultAsync(v => v.VideoID == videoId && v.CourseID == courseId && v.Course.TeacherID == teacherId);

        if (video == null)
            return NotFound("Video not found or you don't have permission");

        if (!string.IsNullOrWhiteSpace(req.VideoName))
            video.VideoName = req.VideoName;
        
        if (!string.IsNullOrWhiteSpace(req.VideoURL))
            video.VideoURL = req.VideoURL;
        
        if (req.IsPreview.HasValue)
            video.IsPreview = req.IsPreview.Value;
        
        if (req.ResourceJson != null)
            video.ResourceJson = req.ResourceJson;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Video updated successfully" });
    }

    // Delete a video
    [HttpDelete("{teacherId:int}/courses/{courseId:int}/videos/{videoId:int}")]
    public async Task<ActionResult> DeleteVideo([FromRoute] int teacherId, [FromRoute] int courseId, [FromRoute] int videoId)
    {
        var video = await _db.CourseVideos
            .Include(v => v.Course)
            .FirstOrDefaultAsync(v => v.VideoID == videoId && v.CourseID == courseId && v.Course.TeacherID == teacherId);

        if (video == null)
            return NotFound("Video not found or you don't have permission");

        _db.CourseVideos.Remove(video);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Video deleted successfully" });
    }
}

// DTOs for Teacher Controller
public record CreateCourseRequest(string CourseName, string? Description, byte CourseLevel);
public record UpdateCourseRequest(string? CourseName, string? Description);
public record CreateChapterRequest(string ChapterName);
public record UpdateChapterRequest(string? ChapterName);
public record CreateVideoRequest(string VideoName, string VideoURL, bool IsPreview, string? ResourceJson);
public record UpdateVideoRequest(string? VideoName, string? VideoURL, bool? IsPreview, string? ResourceJson);
