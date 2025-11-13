namespace EMT_API.DTOs.TeacherQuiz
{
    public class TeacherUpdateQuizRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int QuizType { get; set; }   // 1=Listening, 2=Reading, 3=Writing, 4=Speaking
        public bool? IsActive { get; set; } // optional toggle
    }

    public class CreateGroupRequest
    {
        public string? Instruction { get; set; }
        public byte GroupType { get; set; }
        public int GroupOrder { get; set; }
    }

    public class UpdateGroupRequest
    {
        public string? Instruction { get; set; }
        public byte? GroupType { get; set; }
        public int? GroupOrder { get; set; }
    }

    public class CreateQuestionRequest
    {
        public string Content { get; set; } = string.Empty;
        public byte QuestionType { get; set; }
        public int QuestionOrder { get; set; }
        public decimal ScoreWeight { get; set; }
        public string? MetaJson { get; set; }
    }

    public class UpdateQuestionRequest
    {
        public string? Content { get; set; }
        public byte? QuestionType { get; set; }
        public int? QuestionOrder { get; set; }
        public decimal? ScoreWeight { get; set; }
        public string? MetaJson { get; set; }
    }

    public class CreateOptionRequest
    {
        public string Content { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    public class UpdateOptionRequest
    {
        public string? Content { get; set; }
        public bool? IsCorrect { get; set; }
    }

    public class CreateAssetRequest
    {
        public byte AssetType { get; set; }
        public string? Url { get; set; }
        public string? ContentText { get; set; }
        public string? Caption { get; set; }
        public string? MimeType { get; set; }
    }

}
