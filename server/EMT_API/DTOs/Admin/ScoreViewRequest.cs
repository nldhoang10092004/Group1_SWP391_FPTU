namespace EMT_API.DTOs.Admin
{
    public class ScoreViewRequest
    {
        public int AttemptId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; }
        public int? CourseId { get; set; }
        public string CourseName { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public double Score { get; set; }
        public DateTime AttemptDate { get; set; }
    }
}
