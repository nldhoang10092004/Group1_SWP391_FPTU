namespace EMT_API.DTOs.Admin
{
    public class QuizDTO
    {
        public int QuizID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? CourseID { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class QuizCreateDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? CourseID { get; set; }
        public int? QuizType { get; set; }
    }

    public class QuizUpdateDTO
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? CourseID { get; set; }
    }
}
