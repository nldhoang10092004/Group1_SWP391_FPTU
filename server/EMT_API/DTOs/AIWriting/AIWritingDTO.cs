namespace EMT_API.DTOs.AIWriting
{
    public class AIWritingPromptResponse
    {
        public string Title { get; set; } = "Writing Task 2 - AI Gen";
        public string Content { get; set; } = string.Empty;
    }

    public class AIWritingSubmitRequest
    {
        public string AnswerText { get; set; } = string.Empty;
        public string PromptContent { get; set; } = string.Empty; // ✅ đề bài AI sinh ra
    }


    public class AIWritingFeedbackResponse
    {
        public decimal Score { get; set; }
        public decimal TaskResponse { get; set; }
        public decimal Coherence { get; set; }
        public decimal LexicalResource { get; set; }
        public decimal Grammar { get; set; }
        public string Feedback { get; set; } = string.Empty;
        public int AttemptId { get; set; }
    }
}
