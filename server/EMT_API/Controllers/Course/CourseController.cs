using EMT_API.Data;
using EMT_API.DTOs.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.Public
{
    [ApiController]
    [Route("api/public/course")]
    public class CourseController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public CourseController(EMTDbContext db) => _db = db;

        // GET: api/public/course
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
        {
            var courses = await _db.Courses
                .Select(c => new CourseDto
                {
                    CourseID = c.CourseID,
                    CourseName = c.CourseName,
                    Description = c.Description ?? "",
                    CourseLevel = c.CourseLevel
                })
                .OrderBy(c => c.CourseLevel)
                .ToListAsync();

            return Ok(new { Courses = courses });
        }

        // GET: api/public/course/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CourseDto>> GetCourseDetail(int id)
        {
            var course = await _db.Courses
                .Where(c => c.CourseID == id)
                .Select(c => new CourseDto
                {
                    CourseID = c.CourseID,
                    CourseName = c.CourseName,
                    Description = c.Description ?? "",
                    CourseLevel = c.CourseLevel,
                    Chapters = c.CourseChapters.Select(ch => new ChapterDto
                    {
                        ChapterID = ch.ChapterID,
                        ChapterName = ch.ChapterName,
                        Videos = ch.CourseVideos.Select(v => new VideoDto
                        {
                            VideoID = v.VideoID,
                            VideoName = v.VideoName,
                            // ✅ Chỉ hiển thị URL nếu là preview
                            VideoURL = v.IsPreview ? v.VideoURL : null!,
                            IsPreview = v.IsPreview
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (course == null)
                return NotFound(new { Message = "Course not found" });

            return Ok(course);
        }

    }
}
