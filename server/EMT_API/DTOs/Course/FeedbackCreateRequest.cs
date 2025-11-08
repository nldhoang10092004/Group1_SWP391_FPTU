namespace EMT_API.DTOs.Course
{
    public class FeedbackCreateRequest
    {
        public int CourseID { get; set; }
        public byte Rating { get; set; } // 1–5
        public string? Comment { get; set; }
    }
}
