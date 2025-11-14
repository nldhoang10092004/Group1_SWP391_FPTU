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
            var payload = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "user", content = $"Generate an IELTS quiz.\nTeacher request: {teacherPrompt}" }
                },
                temperature = 0.7,

                // ========================================
                // 🔥 BẮT BUỘC AI TRẢ JSON CHUẨN THEO SCHEMA
                // ========================================
                response_format = new
                {
                    type = "json_schema",
                    json_schema = new
                    {
                        name = "quiz_schema",
                        schema = new
                        {
                            type = "object",
                            properties = new
                            {
                                Title = new { type = "string" },
                                Description = new { type = "string" },

                                Questions = new
                                {
                                    type = "array",
                                    items = new
                                    {
                                        type = "object",
                                        properties = new
                                        {
                                            QuestionType = new { type = "integer" },
                                            Content = new { type = "string" },
                                            Options = new
                                            {
                                                type = "array",
                                                items = new
                                                {
                                                    type = "object",
                                                    properties = new
                                                    {
                                                        Content = new { type = "string" },
                                                        IsCorrect = new { type = "boolean" }
                                                    },
                                                    required = new[] { "Content", "IsCorrect" }
                                                }
                                            }
                                        },
                                        required = new[] { "QuestionType", "Content", "Options" }
                                    }
                                }
                            },
                            required = new[] { "Title", "Description", "Questions" }
                        }
                    }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

            var response = await _http.PostAsync("https://api.openai.com/v1/chat/completions", content);
            var raw = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(raw);
            var result = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return result ?? "{}";
        }
    }
}
