using EMT_API.DTOs.Feedback;
using EMT_API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EMT_API.DAOs
{
    public interface IFeedbackDAO
    {
        // ----- USER -----
        Task<bool> HasFeedbackAsync(int courseId, int userId);
        Task<Feedback> CreateFeedbackAsync(Feedback feedback);

        // ----- PUBLIC -----
        Task<(double average, int total)> GetCourseRatingAsync(int courseId);
        Task<List<FeedbackViewDto>> GetCourseFeedbacksAsync(int courseId);

        // ----- TEACHER -----
        Task<List<FeedbackViewDto>> GetTeacherFeedbacksAsync(int teacherId);

        // ----- ADMIN -----
        Task<List<FeedbackViewDto>> GetAllFeedbacksAsync();
        Task<bool> ToggleVisibilityAsync(int feedbackId);
        Task<bool> DeleteFeedbackAsync(int feedbackId);
    }
}
