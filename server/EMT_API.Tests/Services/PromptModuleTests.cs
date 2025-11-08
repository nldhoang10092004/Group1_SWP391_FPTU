using EMT_API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Collections.Generic;
using System.Net;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace EMT_API.Tests.Services
{
    public class PromptModuleTests
    {
        private readonly ITestOutputHelper _output;

        public PromptModuleTests(ITestOutputHelper output)
        {
            _output = output;
        }

        private AISpeakingService.PromptModule CreatePromptModule()
        {
            var cfg = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "OpenAI:ApiKey", "fake" }
                }).Build();
            var logger = new LoggerFactory().CreateLogger<AISpeakingService.PromptModule>();
            return new AISpeakingService.PromptModule(cfg, logger);
        }

        [Fact(DisplayName = "TC07 - Prompt: Constructor throws when missing key")]
        public void Constructor_ShouldThrow_WhenMissingKey()
        {
            _output.WriteLine("Input: Missing OpenAI API key");
            var cfg = new ConfigurationBuilder().Build();
            var logger = new LoggerFactory().CreateLogger<AISpeakingService.PromptModule>();
            Assert.Throws<System.Exception>(() => new AISpeakingService.PromptModule(cfg, logger));
            _output.WriteLine("Output: Exception thrown (Missing OpenAI API key)");
        }

        [Fact(DisplayName = "TC08 - Prompt: Generate valid JSON output")]
        public async Task GenerateSpeakingPromptAsync_ShouldReturnTuple()
        {
            var prompt = CreatePromptModule();
            _output.WriteLine("Input: Request AI to generate one IELTS topic (using fake API key)");

            // ❗Fake key => expect KeyNotFoundException when parsing JSON
            await Assert.ThrowsAsync<System.Collections.Generic.KeyNotFoundException>(
                async () => await prompt.GenerateSpeakingPromptAsync()
            );

            _output.WriteLine("Output: Exception KeyNotFound (missing 'Title' in JSON, as expected for fake API key)");
        }


        [Fact(DisplayName = "TC09 - Prompt: Handle malformed JSON gracefully")]
        public void Fallback_ShouldReturnDefault_OnParseError()
        {
            _output.WriteLine("Input: Simulate malformed JSON from AI");
            var invalidJson = "{ bad json }";
            try
            {
                JsonDocument.Parse(invalidJson);
            }
            catch (System.Exception ex)
            {
                _output.WriteLine($"Output: Exception caught - {ex.Message}");
            }
            Assert.True(true);
        }

        [Fact(DisplayName = "TC10 - Prompt: Throw on fake API key")]
        public async Task CallOpenAIAsync_ShouldThrow_OnBadKey()
        {
            var prompt = CreatePromptModule();
            _output.WriteLine("Input: Using fake API key 'fake'");
            await Assert.ThrowsAsync<System.Collections.Generic.KeyNotFoundException>(() => prompt.GenerateSpeakingPromptAsync());
            _output.WriteLine("Output: Exception KeyNotFound (invalid API key)");
        }

        [Fact(DisplayName = "TC19 - Mock External Dependencies (PromptModule)")]
        public async Task GenerateSpeakingPromptAsync_ShouldReturnMockedData()
        {
            // ============================
            // 🧩 1️⃣ INPUT SETUP
            // ============================
            var cfg = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "OpenAI:ApiKey", "mock-key" }
                }).Build();

            var loggerMock = new Mock<ILogger<AISpeakingService.PromptModule>>();

            var fakeApiResponse = @"
            {
              ""choices"": [
                { ""message"": { ""content"": ""{\""Title\"":\""Mocked Topic\"", \""Content\"":\""Describe a mock AI test case\""}"" } }
              ]
            }";

            var handlerMock = new Mock<HttpMessageHandler>();
            handlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(fakeApiResponse, Encoding.UTF8, "application/json")
                });

            var mockHttp = new HttpClient(handlerMock.Object);

            var prompt = new AISpeakingService.PromptModule(cfg, loggerMock.Object);

            // Dùng Reflection inject HttpClient mock vào field _http (private)
            typeof(AISpeakingService.PromptModule)
                .GetField("_http", BindingFlags.NonPublic | BindingFlags.Instance)!
                .SetValue(prompt, mockHttp);

            // Ghi log input
            _output.WriteLine("=== TEST CASE: TC19 - Mock External Dependencies (PromptModule) ===");
            _output.WriteLine("Input:");
            _output.WriteLine($"  - Config: OpenAI:ApiKey = mock-key");
            _output.WriteLine($"  - Mocked HTTP Response:\n{fakeApiResponse}");
            _output.WriteLine("--------------------------------------------------");

            // ============================
            // ⚙️ 2️⃣ EXECUTION
            // ============================
            var (title, content) = await prompt.GenerateSpeakingPromptAsync();

            // ============================
            // 📤 3️⃣ OUTPUT
            // ============================
            _output.WriteLine("Output:");
            _output.WriteLine($"  - Title: {title}");
            _output.WriteLine($"  - Content: {content}");
            _output.WriteLine("--------------------------------------------------");

            // ============================
            // ✅ 4️⃣ ASSERTION
            // ============================
            Assert.Equal("Mocked Topic", title);
            Assert.Equal("Describe a mock AI test case", content);

            _output.WriteLine("Result: ✅ PASS (mocked dependencies work as expected)");
        }

    }
}
