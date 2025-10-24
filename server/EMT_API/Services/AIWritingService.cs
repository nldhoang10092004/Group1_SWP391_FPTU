using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EMT_API.Services
{
    public class AIWritingService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        private readonly ILogger<AIWritingService> _logger;

        public AIWritingService(IConfiguration config, ILogger<AIWritingService> logger)
        {
            _http = new HttpClient();
            _apiKey = config["OpenAI:ApiKey"] ?? throw new Exception("Missing OpenAI API key");
            _logger = logger;
        }

        // ======================
        // 🔹 1️⃣ Sinh đề Writing Task 2
        // ======================
        public async Task<(string title, string content)> GenerateWritingPromptAsync()
        {
            var prompt = @"
                You are an IELTS Writing Task 2 question generator.
                Generate ONE IELTS Writing Task 2 topic, formatted strictly as JSON string:
                {""Title"":""Writing Task 2 - AI Gen"",""Content"":""<the question here>""}
                The question must be realistic, academic, 1–2 sentences only, in English.
            ";

            var jsonResponse = await CallOpenAIAsync(prompt);
            try
            {
                var doc = JsonDocument.Parse(jsonResponse);
                var title = doc.RootElement.GetProperty("Title").GetString() ?? "Writing Task 2 - AI Gen";
                var content = doc.RootElement.GetProperty("Content").GetString() ?? "";
                return (title, content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI JSON parse error: {Response}", jsonResponse);
                return ("Writing Task 2 - AI Gen", "Describe a major change in modern education and its effects.");
            }
        }

        // ======================
        // 🔹 2️⃣ Chấm điểm Writing bài làm
        // ======================
        public async Task<(decimal overall, decimal task, decimal coherence, decimal lexical, decimal grammar, string feedback)>
            GradeWritingAsync(string essay)
        {
            var gradingPrompt = $@"
You are an IELTS Writing examiner. 
Evaluate the following essay and respond **only** with a single valid JSON string (no extra text, no commentary).
Format must be exactly like this:
{{
  ""score"": <overall 0–9>,
  ""TaskResponse"": <0–9>,
  ""Coherence"": <0–9>,
  ""LexicalResource"": <0–9>,
  ""Grammar"": <0–9>,
  ""feedback"": ""<2–3 sentences feedback>""
}}
Essay: {essay}
";

            var jsonResponse = await CallOpenAIAsync(gradingPrompt);
            var pureJson = ExtractJsonString(jsonResponse);
            try
            {
                var doc = JsonDocument.Parse(pureJson);
                decimal overall = doc.RootElement.GetProperty("score").GetDecimal();
                decimal task = doc.RootElement.GetProperty("TaskResponse").GetDecimal();
                decimal coherence = doc.RootElement.GetProperty("Coherence").GetDecimal();
                decimal lexical = doc.RootElement.GetProperty("LexicalResource").GetDecimal();
                decimal grammar = doc.RootElement.GetProperty("Grammar").GetDecimal();
                string feedback = doc.RootElement.GetProperty("feedback").GetString() ?? "";
                return (overall, task, coherence, lexical, grammar, feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI grading JSON parse error: {Response}", jsonResponse);
                return (6.0m, 6.5m, 6.0m, 6.5m, 6.0m, "Default fallback: parsing failed.");
            }
        }

        // ======================
        // 🔹 Helper: gọi OpenAI API
        // ======================
        private async Task<string> CallOpenAIAsync(string prompt)
        {
            var payload = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.7
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

            var res = await _http.PostAsync("https://api.openai.com/v1/chat/completions", content);
            var json = await res.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);
            var message = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return message ?? "{}";
        }

        private static string ExtractJsonString(string raw)
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                raw,
                @"\{[\s\S]*\}",
                System.Text.RegularExpressions.RegexOptions.Multiline
            );
            return match.Success ? match.Value : "{}";
        }

    }
}
