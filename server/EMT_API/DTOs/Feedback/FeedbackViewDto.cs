namespace EMT_API.DTOs.Feedback
{
    public class FeedbackViewDto
    {
        public int FeedbackId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = null!;
        public byte Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsVisible { get; set; }
    }

    public class FeedbackCreateRequest
    {
        public int CourseID { get; set; }
        public byte Rating { get; set; }
        public string? Comment { get; set; }
    }
}
