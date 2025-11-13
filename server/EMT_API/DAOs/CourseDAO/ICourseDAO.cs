using EMT_API.Models;

namespace EMT_API.DAOs.CourseDAO
{
    public interface ICourseDAO
    {
        // -------- COURSE BASE --------
        Task<List<Course>> GetAllCoursesAsync();
        Task<Course?> GetCourseDetailAsync(int courseId);
        Task<bool> CourseExistsAsync(int courseId);

        // -------- TEACHER SIDE --------
        Task<List<Course>> GetCoursesByTeacherAsync(int teacherId);
        Task<Course?> CreateCourseAsync(Course course);
        Task<bool> UpdateCourseAsync(Course course);
        Task<bool> DeleteCourseAsync(int courseId);

        Task<CourseChapter?> AddChapterAsync(CourseChapter chapter);
        Task<bool> UpdateChapterAsync(CourseChapter chapter);
        Task<bool> DeleteChapterAsync(int chapterId);

        //Video
        Task<CourseVideo?> GetVideoAsync(int videoId);
        Task<CourseVideo?> AddVideoAsync(CourseVideo video);
        Task<bool> DeleteVideoAsync(int videoId);
    }
}
