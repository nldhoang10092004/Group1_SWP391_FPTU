using System.Collections.Generic;

namespace EMT_API.DTOs.Admin
{
    public class QuizDetailDto
    {
        public int QuizID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public List<QuestionGroupDto> Groups { get; set; } = new();
    }

    public class QuestionGroupDto
    {
        public int GroupID { get; set; }
        public string Instruction { get; set; } = string.Empty;
        public string? GroupType { get; set; }
        public int? GroupOrder { get; set; }

        public List<QuestionDto> Questions { get; set; } = new();
        public List<AssetDto> Assets { get; set; } = new();
    }

    public class QuestionDto
    {
        public int QuestionID { get; set; }
        public string Content { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public int? QuestionOrder { get; set; }
        public double? ScoreWeight { get; set; }
        public string? MetaJson { get; set; }

        public List<OptionDto> Options { get; set; } = new();
        public List<AssetDto> Assets { get; set; } = new();
    }

    public class OptionDto
    {
        public int OptionID { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    public class AssetDto
    {
        public int AssetID { get; set; }
        public int OwnerType { get; set; }  // 1 = Group, 2 = Question
        public int OwnerID { get; set; }
        public string AssetType { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? ContentText { get; set; }
        public string? Caption { get; set; }
        public string? MimeType { get; set; }
    }
}
