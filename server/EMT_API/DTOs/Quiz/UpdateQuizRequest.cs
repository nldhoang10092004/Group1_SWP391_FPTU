namespace EMT_API.DTOs.Quiz
{
    public class UpdateQuizRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? QuizType { get; set; }
        public bool? IsActive { get; set; }

        // Optional: Update nested groups/questions if needed
        public List<UpdateQuestionGroupDto>? Groups { get; set; }
    }

    public class UpdateQuestionGroupDto
    {
        public int GroupID { get; set; }
        public string? Instruction { get; set; }
        public List<UpdateQuestionDto>? Questions { get; set; }
    }

    public class UpdateQuestionDto
    {
        public int QuestionID { get; set; }
        public string? Content { get; set; }
        public string? QuestionType { get; set; }
        public List<UpdateOptionDto>? Options { get; set; }
    }

    public class UpdateOptionDto
    {
        public int OptionID { get; set; }
        public string? Content { get; set; }
        public bool? IsCorrect { get; set; }
    }
}
