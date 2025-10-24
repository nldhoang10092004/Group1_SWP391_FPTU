namespace EMT_API.DTOs.Quiz
{
    public class QuizDto
    {
        public int QuizID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int QuizType { get; set; }  // 1=Listening, 2=Reading...
    }

    public class QuizDetailDto : QuizDto
    {
        public List<QuestionGroupDto> Groups { get; set; } = new();
    }

    public class QuestionGroupDto
    {
        public int GroupID { get; set; }
        public string? Instruction { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionDto
    {
        public int QuestionID { get; set; }
        public string Content { get; set; } = string.Empty;
        public List<OptionDto> Options { get; set; } = new();
        public byte QuestionType { get; internal set; }
    }

    public class OptionDto
    {
        public int OptionID { get; set; }
        public string Content { get; set; } = string.Empty;
    }

}
