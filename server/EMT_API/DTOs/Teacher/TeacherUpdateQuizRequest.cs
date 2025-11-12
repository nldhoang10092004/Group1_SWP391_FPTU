namespace EMT_API.DTOs.TeacherQuiz
{
    public class TeacherUpdateQuizRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int QuizType { get; set; }   // 1=Listening, 2=Reading, 3=Writing, 4=Speaking
        public bool? IsActive { get; set; } // optional toggle
    }
}
