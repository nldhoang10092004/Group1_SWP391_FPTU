using EMT_API.Models;

namespace EMT_API.DAOs.CourseDAO
{
    public interface ICourseDAO
    {
        // -------- COURSE BASE --------
        Task<List<Course>> GetAllCoursesAsync();
        Task<Course?> GetCourseDetailAsync(int courseId);
        Task<bool> CourseExistsAsync(int courseId);

        // -------- RATING & FEEDBACK --------
        Task<(double AverageRating, int TotalFeedback)> GetCourseRatingAsync(int courseId);
        Task<List<Feedback>> GetCourseFeedbacksAsync(int courseId);
        Task<Feedback?> CreateFeedbackAsync(Feedback feedback);
        Task<bool> HasFeedbackAsync(int courseId, int userId);

        // -------- TEACHER SIDE --------
        Task<List<Course>> GetCoursesByTeacherAsync(int teacherId);
        Task<Course?> CreateCourseAsync(Course course);
        Task<bool> UpdateCourseAsync(Course course);
        Task<bool> DeleteCourseAsync(int courseId);

        Task<CourseChapter?> AddChapterAsync(CourseChapter chapter);
        Task<bool> UpdateChapterAsync(CourseChapter chapter);
        Task<bool> DeleteChapterAsync(int chapterId);

        Task<CourseVideo?> AddVideoAsync(CourseVideo video);
        Task<bool> DeleteVideoAsync(int videoId);
    }
}
