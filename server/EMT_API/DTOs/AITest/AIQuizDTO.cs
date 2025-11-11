using System.Text.Json;

namespace EMT_API.DTOs.AITest
{
    public class AIQuizRequest
    {
        public string Prompt { get; set; } = string.Empty;
    }

    public class AIQuizResponse
    {
        public JsonElement? Json { get; set; }
        public string RawText { get; set; } = string.Empty;
        public string? Error { get; set; }
    }
}
