using EMT_API.DTOs.Quiz;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace EMT_API.DAOs
{
    public interface IQuizDAO
    {
        // Student/User
        Task<List<QuizDto>> GetQuizzesByCourseAsync(int courseId);
        Task<List<QuizDto>> GetGlobalQuizzesAsync();
        Task<QuizDetailDto?> GetQuizDetailAsync(int quizId);
        Task<int> StartQuizAsync(int quizId, int userId);
        Task<decimal?> SubmitQuizAsync(int attemptId, int userId, SubmitQuizRequest request);
        Task<List<object>> GetAttemptHistoryAsync(int userId);

        // Teacher
        Task<bool> TeacherOwnsCourseAsync(int teacherId, int courseId);
        Task<bool> TeacherOwnsQuizAsync(int teacherId, int quizId);
        Task<int> CreateQuizAsync(int courseId, string title, string? description, byte quizType);
        Task<bool> UpdateQuizAsync(int quizId, string? title, string? description, int quizType, bool? isActive);
        Task<bool> DeleteQuizAsync(int quizId);
        Task<bool> ImportQuizAsync(int quizId, ImportQuizRequest request);

        // Admin
        Task<List<QuizDto>> GetAllGlobalQuizzesAsync();
        Task<QuizDetailDto?> GetGlobalQuizDetailAsync(int quizId);
        Task<int> CreateGlobalQuizAsync(string title, string? description, byte quizType);
        Task<bool> DeleteGlobalQuizAsync(int quizId);
        Task<bool> ImportGlobalQuizAsync(int quizId, ImportQuizRequest request);
        Task<bool> UpdateGlobalQuizAsync(int quizId, UpdateQuizRequest request);

        Task<List<object>> GetAttemptsAsync(string role, int userId);

    }
}
