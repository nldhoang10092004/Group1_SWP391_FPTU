using Deepgram;
using Deepgram.Clients.Interfaces.v1;
using Deepgram.Clients.Listen.v1.REST;
using Deepgram.Models.Listen.v1.REST;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace EMT_API.Services
{

    public class AISpeakingService
    {
        private readonly TranscriptionModule _transcriber;
        private readonly PromptModule _prompt;
        private readonly GradingModule _grader;

        public AISpeakingService(IConfiguration config, ILogger<AISpeakingService> logger)
        {
            _transcriber = new TranscriptionModule(config, logger);
            _prompt = new PromptModule(config, logger);
            _grader = new GradingModule(config, logger);
        }


        public async Task<string> TranscribeAsync(IFormFile file)
            => await _transcriber.TranscribeAsync(file);

        public async Task<(string title, string content)> GenerateSpeakingPromptAsync()
            => await _prompt.GenerateSpeakingPromptAsync();


        public async Task<(decimal overall, decimal fluency, decimal lexical, decimal grammar, decimal pronunciation, string feedback)>
            GradeSpeakingAsync(string transcript, string topic)
            => await _grader.GradeSpeakingAsync(transcript, topic);

        internal class TranscriptionModule
        {
            private readonly IListenRESTClient _deepgramClient;
            private readonly ILogger _logger;

            public TranscriptionModule(IConfiguration cfg, ILogger logger)
            {
                Library.Initialize();
                var deepgramKey = cfg["Deepgram:ApiKey"];
                if (string.IsNullOrWhiteSpace(deepgramKey))
                    throw new Exception("Missing Deepgram API key");

                _deepgramClient = ClientFactory.CreateListenRESTClient(deepgramKey);
                _logger = logger;
            }

            public async Task<string> TranscribeAsync(IFormFile file)
            {
                if (file == null || file.Length == 0)
                    throw new ArgumentException("Invalid audio file.");

                await using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                var res = await _deepgramClient.TranscribeFile(ms.ToArray(),
                    new PreRecordedSchema()
                    {
                        Model = "nova-3",
                        Language = "en",
                        SmartFormat = true,
                        Paragraphs = true
                    });

                var transcript = res.Results?
                    .Channels?.FirstOrDefault()?
                    .Alternatives?.FirstOrDefault()?
                    .Transcript ?? "";

                _logger.LogInformation("Transcription length: {len}", transcript.Length);
                return transcript;
            }

            ~TranscriptionModule()
            {
                Library.Terminate();
            }
        }

        internal class PromptModule
        {
            private readonly HttpClient _http;
            private readonly string _openAiKey;
            private readonly ILogger _logger;

            public PromptModule(IConfiguration cfg, ILogger logger)
            {
                _http = new HttpClient();
                _openAiKey = cfg["OpenAI:ApiKey"] ?? throw new Exception("Missing OpenAI API key");
                _logger = logger;
            }

            public async Task<(string title, string content)> GenerateSpeakingPromptAsync()
            {
                var systemPrompt = @"
You are an IELTS Speaking Part 2 question generator.
Generate ONE realistic IELTS Speaking Part 2 topic formatted strictly as JSON string:
{
  ""Title"": ""IELTS Speaking Part 2 - AI Gen"",
  ""Content"": ""<the topic card question here>""
}
The topic should ask the candidate to describe or talk about something personal, 1–2 sentences only.
";

                var jsonResponse = await CallOpenAIAsync(systemPrompt);

                try
                {
                    var doc = JsonDocument.Parse(jsonResponse);
                    string title = doc.RootElement.GetProperty("Title").GetString() ?? "IELTS Speaking Part 2 - AI Gen";
                    string content = doc.RootElement.GetProperty("Content").GetString() ?? "";
                    return (title, content);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "AI JSON parse error: {Response}", jsonResponse);
                    return ("IELTS Speaking Part 2 - AI Gen", "Describe a memorable event in your life and explain why it was special.");
                }
            }

            private async Task<string> CallOpenAIAsync(string prompt)
            {
                var payload = new
                {
                    model = "gpt-4o-mini",
                    messages = new[] { new { role = "user", content = prompt } },
                    temperature = 0.7
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                _http.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAiKey);

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
        }


        internal class GradingModule
        {
            private readonly HttpClient _http;
            private readonly string _openAiKey;
            private readonly ILogger _logger;

            public GradingModule(IConfiguration cfg, ILogger logger)
            {
                _http = new HttpClient();
                _openAiKey = cfg["OpenAI:ApiKey"] ?? throw new Exception("Missing OpenAI API key");
                _logger = logger;
            }

            public async Task<(decimal overall, decimal fluency, decimal lexical, decimal grammar, decimal pronunciation, string feedback)>
                GradeSpeakingAsync(string transcript, string topic)
            {
                if (string.IsNullOrWhiteSpace(transcript))
                    throw new ArgumentException("Transcript cannot be empty.");

                var gradingPrompt = $@"
You are an IELTS Speaking examiner.
Evaluate the following candidate transcript that answers the topic and respond only with a valid JSON string (no extra text).
Format must be exactly like this:
{{
  ""score"": <overall 0–9>,
  ""Fluency"": <0–9>,
  ""LexicalResource"": <0–9>,
  ""Grammar"": <0–9>,
  ""Pronunciation"": <0–9>,
  ""feedback"": ""<2–3 sentences of examiner feedback>""
}}
Transcript: {transcript}
Topic: {topic}
";

                var jsonResponse = await CallOpenAIAsync(gradingPrompt);
                var pureJson = ExtractJsonString(jsonResponse);

                try
                {
                    var doc = JsonDocument.Parse(pureJson);
                    decimal overall = doc.RootElement.GetProperty("score").GetDecimal();
                    decimal fluency = doc.RootElement.GetProperty("Fluency").GetDecimal();
                    decimal lexical = doc.RootElement.GetProperty("LexicalResource").GetDecimal();
                    decimal grammar = doc.RootElement.GetProperty("Grammar").GetDecimal();
                    decimal pronunciation = doc.RootElement.GetProperty("Pronunciation").GetDecimal();
                    string feedback = doc.RootElement.GetProperty("feedback").GetString() ?? "";
                    return (overall, fluency, lexical, grammar, pronunciation, feedback);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "AI speaking grading JSON parse error: {Response}", jsonResponse);
                    return (6.0m, 6.5m, 6.0m, 6.5m, 6.0m, "Default fallback: parsing failed.");
                }
            }

            private async Task<string> CallOpenAIAsync(string prompt)
            {
                var payload = new
                {
                    model = "gpt-4o-mini",
                    messages = new[] { new { role = "user", content = prompt } },
                    temperature = 0.7
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                _http.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAiKey);

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
}
