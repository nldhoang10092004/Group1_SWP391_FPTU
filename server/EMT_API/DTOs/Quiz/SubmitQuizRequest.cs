namespace EMT_API.DTOs.Quiz
{
    public class SubmitQuizRequest
    {
        public List<SubmitAnswerDto> Answers { get; set; } = new();
    }

    public class SubmitAnswerDto
    {
        public int QuestionID { get; set; }
        public int? OptionID { get; set; }  // cho MCQ
        public string? AnswerText { get; set; } // cho writing/speaking
    }
}
