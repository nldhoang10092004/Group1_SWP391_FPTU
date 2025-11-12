using EMT_API.DAOs.CourseDAO;
using EMT_API.DTOs.Public;
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
        private readonly ICourseDAO _dao;
        private readonly CloudflareService _r2;
        private readonly EMT_API.Data.EMTDbContext _db;

        public TeacherCourseController(ICourseDAO dao, CloudflareService r2, EMT_API.Data.EMTDbContext db)
        {
            _dao = dao;
            _r2 = r2;
            _db = db;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private async Task<bool> EnsureTeacherOwnsCourse(int courseId)
        {
            var uid = GetUserId();
            var course = await _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.CourseID == courseId);
            return course != null && course.TeacherID == uid;
        }

        private async Task<bool> EnsureTeacherOwnsChapter(int chapterId)
        {
            var uid = GetUserId();
            var chapter = await _db.CourseChapters.Include(c => c.Course).FirstOrDefaultAsync(c => c.ChapterID == chapterId);
            return chapter != null && chapter.Course.TeacherID == uid;
        }

        private async Task<bool> EnsureTeacherOwnsVideo(int videoId)
        {
            var uid = GetUserId();
            var video = await _db.CourseVideos.Include(v => v.Course).FirstOrDefaultAsync(v => v.VideoID == videoId);
            return video != null && video.Course.TeacherID == uid;
        }

        // =============================
        // Lấy danh sách course của GV
        // =============================
        [HttpGet]
        public async Task<IActionResult> GetMyCourses()
        {
            var uid = GetUserId();
            var courses = await _dao.GetCoursesByTeacherAsync(uid);
            var result = courses.Select(c => new CourseSummaryDto
            {
                CourseID = c.CourseID,
                CourseName = c.CourseName,
                Description = c.Description ?? "",
                CourseLevel = c.CourseLevel,
                CreatedAt = c.CreateAt
            });
            return Ok(new { Courses = result });
        }

        // =============================
        // Chi tiết course
        // =============================
        [HttpGet("{courseId:int}")]
        public async Task<IActionResult> GetCourseDetail(int courseId)
        {
            if (!await EnsureTeacherOwnsCourse(courseId))
                return Forbid();

            var course = await _dao.GetCourseDetailAsync(courseId);
            if (course == null)
                return NotFound(new { message = "Course not found" });

            var dto = new CourseDetailDto
            {
                CourseID = course.CourseID,
                CourseName = course.CourseName,
                Description = course.Description ?? "",
                CourseLevel = course.CourseLevel,
                Chapters = course.CourseChapters.Select(ch => new ChapterDetailDto
                {
                    ChapterID = ch.ChapterID,
                    ChapterName = ch.ChapterName,
                    Videos = ch.CourseVideos.Select(v => new VideoDetailDto
                    {
                        VideoID = v.VideoID,
                        VideoName = v.VideoName,
                        VideoURL = v.VideoURL,
                        IsPreview = v.IsPreview
                    }).ToList()
                }).ToList()
            };

            var orphanVideos = course.CourseVideos
                .Where(v => v.ChapterID == null)
                .Select(v => new VideoDetailDto
                {
                    VideoID = v.VideoID,
                    VideoName = v.VideoName,
                    VideoURL = v.VideoURL,
                    IsPreview = v.IsPreview
                }).ToList();

            if (orphanVideos.Any())
            {
                dto.Chapters.Add(new ChapterDetailDto
                {
                    ChapterID = 0,
                    ChapterName = "(Uncategorized Videos)",
                    Videos = orphanVideos
                });
            }


            return Ok(dto);
        }

        // =============================
        // COURSE CRUD
        // =============================
        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest req)
        {
            var course = new Course
            {
                TeacherID = GetUserId(),
                CourseName = req.CourseName,
                Description = req.Description,
                CourseLevel = req.CourseLevel,
                CreateAt = DateTime.UtcNow
            };

            var created = await _dao.CreateCourseAsync(course);
            return Ok(new { message = "Course created", courseId = created.CourseID });
        }

        [HttpPut("{courseId:int}")]
        public async Task<IActionResult> UpdateCourse(int courseId, [FromBody] UpdateCourseRequest req)
        {
            if (!await EnsureTeacherOwnsCourse(courseId)) return Forbid();

            var course = new Course
            {
                CourseID = courseId,
                CourseName = req.CourseName,
                Description = req.Description
            };

            var ok = await _dao.UpdateCourseAsync(course);
            return ok ? Ok(new { message = "Course updated" }) : NotFound();
        }

        [HttpDelete("{courseId:int}")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            if (!await EnsureTeacherOwnsCourse(courseId)) return Forbid();

            var ok = await _dao.DeleteCourseAsync(courseId);
            if (!ok) return NotFound();

            return Ok(new { message = "Course deleted" });
        }

        // =============================
        // CHAPTER CRUD
        // =============================
        [HttpPost("{courseId:int}/chapter")]
        public async Task<IActionResult> AddChapter(int courseId, [FromBody] CreateChapterRequest req)
        {
            if (!await EnsureTeacherOwnsCourse(courseId)) return Forbid();

            var created = await _dao.AddChapterAsync(new CourseChapter
            {
                CourseID = courseId,
                ChapterName = req.ChapterName
            });

            return Ok(new { message = "Chapter added", chapterId = created!.ChapterID });
        }

        [HttpPut("chapter/{chapterId:int}")]
        public async Task<IActionResult> UpdateChapter(int chapterId, [FromBody] UpdateChapterRequest req)
        {
            if (!await EnsureTeacherOwnsChapter(chapterId)) return Forbid();

            var ok = await _dao.UpdateChapterAsync(new CourseChapter
            {
                ChapterID = chapterId,
                ChapterName = req.ChapterName
            });

            return ok ? Ok(new { message = "Chapter updated" }) : NotFound();
        }

        [HttpDelete("chapter/{chapterId:int}")]
        public async Task<IActionResult> DeleteChapter(int chapterId)
        {
            if (!await EnsureTeacherOwnsChapter(chapterId)) return Forbid();

            var ok = await _dao.DeleteChapterAsync(chapterId);
            return ok ? Ok(new { message = "Chapter deleted" }) : NotFound();
        }

        // =============================
        // VIDEO CRUD
        // =============================
        [HttpPost("{chapterId:int}/video")]
        public async Task<IActionResult> AddVideo(int chapterId, [FromBody] CreateVideoRequest req)
        {
            if (!await EnsureTeacherOwnsChapter(chapterId)) return Forbid();

            var chapter = await _db.CourseChapters.FirstOrDefaultAsync(ch => ch.ChapterID == chapterId);
            if (chapter == null) return NotFound();

            var created = await _dao.AddVideoAsync(new CourseVideo
            {
                CourseID = chapter.CourseID,
                ChapterID = chapterId,
                VideoName = req.VideoName,
                VideoURL = req.VideoURL,
                IsPreview = req.IsPreview
            });

            return Ok(new { message = "Video added", videoId = created!.VideoID });
        }

        [HttpDelete("video/{videoId:int}")]
        public async Task<IActionResult> DeleteVideo(int videoId)
        {
            if (!await EnsureTeacherOwnsVideo(videoId)) return Forbid();

            var ok = await _dao.DeleteVideoAsync(videoId);
            return ok ? Ok(new { message = "Video deleted" }) : NotFound();
        }
    }
}
