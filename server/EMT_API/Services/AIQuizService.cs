using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EMT_API.Services
{
    public class AIQuizService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        private readonly ILogger<AIQuizService> _logger;

        public AIQuizService(IConfiguration config, ILogger<AIQuizService> logger)
        {
            _http = new HttpClient();
            _apiKey = config["OpenAI:ApiKey"] ?? throw new Exception("Missing OpenAI API key");
            _logger = logger;
        }

        public async Task<string> GenerateQuizAsync(string teacherPrompt)
        {
            var prompt = $@"
You are an IELTS quiz generator for English learning.
Generate ONE quiz as a **valid JSON** object strictly in this format:
{{
  ""Title"": ""<title>"",
  ""Description"": ""<short description>"",
  ""Questions"": [
    {{
      ""QuestionType"": 1,
      ""Content"": ""<question text>"",
      ""Options"": [
        {{""Content"": ""<choice 1>"", ""IsCorrect"": true/false}},
        {{""Content"": ""<choice 2>"", ""IsCorrect"": true/false}},
        {{""Content"": ""<choice 3>"", ""IsCorrect"": true/false}},
        {{""Content"": ""<choice 4>"", ""IsCorrect"": true/false}}
      ]
    }},
    ...
  ]
}}

Rules:
- Always output only one JSON object (no explanation).
- The content must be academic and IELTS-style.
Teacher request: {teacherPrompt}
";

            var jsonResponse = await CallOpenAIAsync(prompt);
            var pureJson = ExtractJsonString(jsonResponse);
            return pureJson;
        }

        private async Task<string> CallOpenAIAsync(string prompt)
        {
            var payload = new
            {
                model = "gpt-4o-mini",
                messages = new[] { new { role = "user", content = prompt } },
                temperature = 0.8
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
            var match = System.Text.RegularExpressions.Regex.Match(raw, @"\{[\s\S]*\}");
            return match.Success ? match.Value : "{}";
        }
    }
}
