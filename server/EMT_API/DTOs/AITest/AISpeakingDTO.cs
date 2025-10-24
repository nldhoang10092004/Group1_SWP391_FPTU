namespace EMT_API.DTOs.AITest
{
    public class AudioUploadRequest
    {
        public IFormFile File { get; set; } = null!;
    }


    public class AISpeakingSubmitRequest
    {
        public string Transcript { get; set; } = string.Empty;
        public string PromptContent { get; set; } = string.Empty;
    }

}
