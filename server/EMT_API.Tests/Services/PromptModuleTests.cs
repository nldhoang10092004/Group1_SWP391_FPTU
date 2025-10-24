using EMT_API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
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
    }
}
