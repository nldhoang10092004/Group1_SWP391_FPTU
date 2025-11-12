using EMT_API.DAOs.CourseDAO;
using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/courses")]
    [Authorize(Roles = "ADMIN")]
    public class CourseManagementController : ControllerBase
    {
        private readonly ICourseDAO _dao;

        public CourseManagementController(ICourseDAO dao)
        {
            _dao = dao;
        }

        [HttpGet("view")]
        public async Task<IActionResult> GetAllCourses()
        {
            var data = await _dao.GetAllCoursesAsync();
            var result = data.Select(c => new CourseViewResponse
            {
                CourseID = c.CourseID,
                CourseName = c.CourseName,
                CourseDescription = c.Description,
                TeacherID = c.TeacherID,
                TeacherName = c.Teacher?.TeacherNavigation?.Username ?? "(No Teacher)",
                CreateAt = c.CreateAt
            });
            return Ok(result);
        }

        [HttpGet("detail/{courseId:int}")]
        public async Task<IActionResult> GetCourseDetail(int courseId)
        {
            var course = await _dao.GetCourseDetailAsync(courseId);
            if (course == null)
                return NotFound(new { message = "Course not found." });

            var response = new
            {
                course.CourseID,
                course.CourseName,
                course.Description,
                Teacher = course.Teacher != null ? new
                {
                    course.Teacher.TeacherID,
                    TeacherName = course.Teacher.TeacherNavigation?.Username ?? "(Unknown)"
                } : null,
                course.CreateAt,
                Chapters = course.CourseChapters.Select(ch => new
                {
                    ch.ChapterID,
                    ch.ChapterName
                }),
                Videos = course.CourseChapters.SelectMany(ch => ch.CourseVideos).Select(v => new
                {
                    v.VideoID,
                    v.VideoName,
                    v.VideoURL,
                    v.IsPreview
                })
            };

            var orphanVideos = course.CourseVideos
                .Where(v => v.ChapterID == null)
                .Select(v => new
                {
                    v.VideoID,
                    v.VideoName,
                    v.VideoURL,
                    v.IsPreview
                }).ToList();

            if (orphanVideos.Any())
            {
                response = new
                {
                    response.CourseID,
                    response.CourseName,
                    response.Description,
                    response.Teacher,
                    response.CreateAt,
                    Chapters = response.Chapters,
                    Videos = response.Videos.Concat(orphanVideos)
                };
            }

            return Ok(response);
        }

        [HttpDelete("delete/{courseId}")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            var ok = await _dao.DeleteCourseAsync(courseId);
            return ok ? Ok(new { message = "Course deleted successfully." }) : NotFound(new { message = "Course not found." });
        }
    }
}
