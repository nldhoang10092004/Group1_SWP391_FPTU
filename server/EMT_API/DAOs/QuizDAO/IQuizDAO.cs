using EMT_API.DTOs.Quiz;
using EMT_API.DTOs.TeacherQuiz;

namespace EMT_API.DAOs
{
    public interface IQuizDAO
    {
        // USER
        Task<List<QuizDto>> GetQuizzesByCourseAsync(int courseId);
        Task<List<QuizDto>> GetGlobalQuizzesAsync();
        Task<QuizDetailDto?> GetQuizDetailAsync(int quizId);
        Task<int> StartQuizAsync(int quizId, int userId);
        Task<decimal?> SubmitQuizAsync(int attemptId, int userId, SubmitQuizRequest request);
        Task<List<object>> GetAttemptHistoryAsync(int userId);

        // TEACHER QUIZ
        Task<bool> TeacherOwnsCourseAsync(int teacherId, int courseId);
        Task<bool> TeacherOwnsQuizAsync(int teacherId, int quizId);

        Task<int> CreateQuizAsync(int courseId, string title, string? description, byte quizType);
        Task<bool> UpdateQuizAsync(int quizId, string? title, string? description, int quizType, bool? isActive);
        Task<bool> DeleteQuizAsync(int quizId);

        // GROUP
        Task<int> CreateGroupAsync(int quizId, CreateGroupRequest req);
        Task<bool> UpdateGroupAsync(int groupId, UpdateGroupRequest req);
        Task<bool> DeleteGroupAsync(int groupId);

        // QUESTION
        Task<int> CreateQuestionAsync(int groupId, CreateQuestionRequest req);
        Task<bool> UpdateQuestionAsync(int questionId, UpdateQuestionRequest req);
        Task<bool> DeleteQuestionAsync(int questionId);

        // OPTION
        Task<int> CreateOptionAsync(int questionId, CreateOptionRequest req);
        Task<bool> UpdateOptionAsync(int optionId, UpdateOptionRequest req);
        Task<bool> DeleteOptionAsync(int optionId);

        // ASSET
        Task<int> CreateAssetForGroupAsync(int groupId, CreateAssetRequest req);
        Task<int> CreateAssetForQuestionAsync(int questionId, CreateAssetRequest req);
        Task<bool> DeleteAssetAsync(int assetId);

        // ADMIN
        Task<List<QuizDto>> GetAllGlobalQuizzesAsync();
        Task<QuizDetailDto?> GetGlobalQuizDetailAsync(int quizId);
        Task<int> CreateGlobalQuizAsync(string title, string? description, byte quizType);
        Task<bool> DeleteGlobalQuizAsync(int quizId);
        Task<bool> UpdateGlobalQuizAsync(int quizId, UpdateQuizRequest req);

        Task<List<object>> GetAttemptsAsync(string role, int userId);
    }
}
