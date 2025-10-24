namespace EMT_API.DTOs.Admin
{
    public class QuizDetailResponse
    {
        public int QuizID { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public byte QuizType { get; set; }
        public int? CourseID { get; set; }
        public List<QuestionGroupResponse> Groups { get; set; } = new();
    }

    public class QuestionGroupResponse
    {
        public int GroupID { get; set; }
        public string Instruction { get; set; } = "";
        public List<QuestionResponse> Questions { get; set; } = new();
    }

    public class QuestionResponse
    {
        public int QuestionID { get; set; }
        public string Content { get; set; } = "";
        public byte QuestionType { get; set; }
        public List<OptionResponse> Options { get; set; } = new();
    }

    public class OptionResponse
    {
        public int OptionID { get; set; }
        public string Content { get; set; } = "";
        public bool IsCorrect { get; set; }
    }
}
