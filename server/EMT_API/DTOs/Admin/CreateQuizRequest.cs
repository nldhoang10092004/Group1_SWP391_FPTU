namespace EMT_API.DTOs.Admin
{
    public class CreateQuizRequest
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public byte QuizType { get; set; }
        public int? CourseID { get; set; } // Có thể null
    }
}
