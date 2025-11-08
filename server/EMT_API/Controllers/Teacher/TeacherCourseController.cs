using EMT_API.Data;
using EMT_API.DTOs.TeacherCourse;
using EMT_API.Models;
using EMT_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers.TeacherSide
{
    [ApiController]
    [Route("api/teacher/course")]
    [Authorize(Roles = "TEACHER")]
    public class TeacherCourseController : ControllerBase
    {
        private readonly EMTDbContext _db;
        private readonly CloudflareService _r2;

        public TeacherCourseController(EMTDbContext db, CloudflareService r2)
        {
            _db = db;
            _r2 = r2;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ===================================================
        // 🔹 Helper methods
        // ===================================================
        private async Task<bool> EnsureTeacherOwnsCourse(int courseId)
        {
            var uid = GetUserId();
            var course = await _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.CourseID == courseId);
            return course != null && course.TeacherID == uid;
        }

        private async Task<bool> EnsureTeacherOwnsChapter(int chapterId)
        {
            var uid = GetUserId();
            var chapter = await _db.CourseChapters
                .Include(c => c.Course)
                .FirstOrDefaultAsync(c => c.ChapterID == chapterId);
            return chapter != null && chapter.Course.TeacherID == uid;
        }

        private async Task<bool> EnsureTeacherOwnsVideo(int videoId)
        {
            var uid = GetUserId();
            var video = await _db.CourseVideos
                .Include(v => v.Course)
                .FirstOrDefaultAsync(v => v.VideoID == videoId);
            return video != null && video.Course.TeacherID == uid;
        }

        // ===================================================
        // 🔹 1️⃣ Lấy danh sách course thuộc teacher hiện tại
        // ===================================================
        [HttpGet]
        public async Task<IActionResult> GetMyCourses()
        {
            var uid = GetUserId();
            var courses = await _db.Courses
                .Where(c => c.TeacherID == uid)
                .OrderBy(c => c.CourseLevel)
                .Select(c => new CourseSummaryDto
                {
                    CourseID = c.CourseID,
                    CourseName = c.CourseName,
                    Description = c.Description ?? "",
                    CourseLevel = c.CourseLevel,
                    CreatedAt = c.CreateAt
                })
                .ToListAsync();

            return Ok(new { Courses = courses });
        }

        // ===================================================
        // 🔹 2️⃣ Lấy chi tiết 1 course của teacher
        // ===================================================
        [HttpGet("{courseId:int}")]
        public async Task<IActionResult> GetCourseDetail(int courseId)
        {
            if (!await EnsureTeacherOwnsCourse(courseId))
                return Forbid();

            var course = await _db.Courses
                .Where(c => c.CourseID == courseId)
                .Select(c => new CourseDetailDto
                {
                    CourseID = c.CourseID,
                    CourseName = c.CourseName,
                    Description = c.Description ?? "",
                    CourseLevel = c.CourseLevel,
                    Chapters = c.CourseChapters.Select(ch => new ChapterDetailDto
                    {
                        ChapterID = ch.ChapterID,
                        ChapterName = ch.ChapterName,
                        Videos = ch.CourseVideos.Select(v => new VideoDetailDto
                        {
                            VideoID = v.VideoID,
                            VideoName = v.VideoName,
                            VideoURL = v.VideoURL, // ✅ Giáo viên luôn được xem full URL
                            IsPreview = v.IsPreview
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (course == null)
                return NotFound(new { message = "Course not found" });

            return Ok(course);
        }

        // ===================================================
        // 🔹 COURSE CRUD
        // ===================================================
        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest req)
        {
            var teacherId = GetUserId();

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
            return Ok(new { message = "Course created", courseId = course.CourseID });
        }

        [HttpPut("{courseId:int}")]
        public async Task<IActionResult> UpdateCourse(int courseId, [FromBody] UpdateCourseRequest req)
        {
            if (!await EnsureTeacherOwnsCourse(courseId)) return Forbid();

            var course = await _db.Courses.FindAsync(courseId);
            if (course == null) return NotFound();

            course.CourseName = req.CourseName;
            course.Description = req.Description;

            _db.Courses.Update(course);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Course updated" });
        }

        [HttpDelete("{courseId:int}")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            if (!await EnsureTeacherOwnsCourse(courseId)) return Forbid();

            var course = await _db.Courses
                .Include(c => c.CourseChapters)
                .ThenInclude(ch => ch.CourseVideos)
                .FirstOrDefaultAsync(c => c.CourseID == courseId);

            if (course == null) return NotFound();

            foreach (var chapter in course.CourseChapters)
            {
                foreach (var video in chapter.CourseVideos)
                {
                    if (video.VideoURL.Contains("r2.cloudflarestorage.com"))
                        await _r2.DeleteFileAsync(video.VideoURL);
                }
            }

            _db.Courses.Remove(course);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Course deleted" });
        }

        // ===================================================
        // 🔹 CHAPTER CRUD
        // ===================================================
        [HttpPost("{courseId:int}/chapter")]
        public async Task<IActionResult> AddChapter(int courseId, [FromBody] CreateChapterRequest req)
        {
            if (!await EnsureTeacherOwnsCourse(courseId)) return Forbid();

            var chapter = new CourseChapter
            {
                CourseID = courseId,
                ChapterName = req.ChapterName
            };

            _db.CourseChapters.Add(chapter);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Chapter added", chapterId = chapter.ChapterID });
        }

        [HttpPut("chapter/{chapterId:int}")]
        public async Task<IActionResult> UpdateChapter(int chapterId, [FromBody] UpdateChapterRequest req)
        {
            if (!await EnsureTeacherOwnsChapter(chapterId)) return Forbid();

            var chapter = await _db.CourseChapters.FindAsync(chapterId);
            if (chapter == null) return NotFound();

            chapter.ChapterName = req.ChapterName;
            _db.CourseChapters.Update(chapter);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Chapter updated" });
        }

        [HttpDelete("chapter/{chapterId:int}")]
        public async Task<IActionResult> DeleteChapter(int chapterId)
        {
            if (!await EnsureTeacherOwnsChapter(chapterId)) return Forbid();

            var chapter = await _db.CourseChapters
                .Include(ch => ch.CourseVideos)
                .FirstOrDefaultAsync(ch => ch.ChapterID == chapterId);

            if (chapter == null) return NotFound();

            foreach (var video in chapter.CourseVideos)
            {
                if (video.VideoURL.Contains("r2.cloudflarestorage.com"))
                    await _r2.DeleteFileAsync(video.VideoURL);
            }

            _db.CourseChapters.Remove(chapter);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Chapter deleted" });
        }

        // ===================================================
        // 🔹 VIDEO CRUD (Chỉ nhận URL)
        // ===================================================
        [HttpPost("{chapterId:int}/video")]
        public async Task<IActionResult> AddVideo(int chapterId, [FromBody] CreateVideoRequest req)
        {
            if (!await EnsureTeacherOwnsChapter(chapterId)) return Forbid();

            var chapter = await _db.CourseChapters.FirstOrDefaultAsync(ch => ch.ChapterID == chapterId);
            if (chapter == null) return NotFound();

            var video = new CourseVideo
            {
                CourseID = chapter.CourseID,
                ChapterID = chapterId,
                VideoName = req.VideoName,
                VideoURL = req.VideoURL,
                IsPreview = req.IsPreview
            };

            _db.CourseVideos.Add(video);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Video added", videoId = video.VideoID });
        }

        [HttpDelete("video/{videoId:int}")]
        public async Task<IActionResult> DeleteVideo(int videoId)
        {
            if (!await EnsureTeacherOwnsVideo(videoId)) return Forbid();

            var video = await _db.CourseVideos.FindAsync(videoId);
            if (video == null) return NotFound();

            if (video.VideoURL.Contains("r2.cloudflarestorage.com"))
                await _r2.DeleteFileAsync(video.VideoURL);

            _db.CourseVideos.Remove(video);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Video deleted" });
        }
    }
}
