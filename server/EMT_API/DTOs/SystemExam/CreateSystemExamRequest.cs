namespace EMT_API.DTOs.SystemExam
{
    public class CreateSystemExamRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public List<QuestionGroupRequest> Groups { get; set; }
        public List<QuestionRequest> Questions { get; set; }
    }

    public class QuestionGroupRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public List<QuestionRequest> Questions { get; set; }
    }

    public class QuestionRequest
    {
        public byte QuestionType { get; set; }
        public string Content { get; set; }
        public decimal ScoreWeight { get; set; }
        public int QuestionOrder { get; set; }
    }
}
