namespace EMT_API.DTOs.AITest
{
    public class AISpeakingSubmitAudioRequest
    {
        public IFormFile File { get; set; } = null!;
        public string PromptContent { get; set; } = string.Empty;
    }
}
