namespace EMT_API.DTOs.Admin
{
    public class UpdateQuizRequest
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public byte QuizType { get; set; }
        public bool IsActive { get; set; }
    }
}
