using EMT_API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace EMT_API.Tests.Services
{
    public class GradingModuleTests
    {
        private readonly ITestOutputHelper _output;

        public GradingModuleTests(ITestOutputHelper output)
        {
            _output = output;
        }

        private AISpeakingService.GradingModule CreateGrader()
        {
            var cfg = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "OpenAI:ApiKey", "fake" }
                }).Build();

            var logger = new LoggerFactory().CreateLogger<AISpeakingService.GradingModule>();
            return new AISpeakingService.GradingModule(cfg, logger);
        }

        [Fact(DisplayName = "TC11 - Grader: Constructor throws when missing key")]
        public void Constructor_ShouldThrow_WhenMissingKey()
        {
            _output.WriteLine("Input: Missing OpenAI API key");
            var cfg = new ConfigurationBuilder().Build();
            var logger = new LoggerFactory().CreateLogger<AISpeakingService.GradingModule>();
            Assert.Throws<System.Exception>(() => new AISpeakingService.GradingModule(cfg, logger));
            _output.WriteLine("Output: Exception thrown (Missing OpenAI API key)");
        }

        [Fact(DisplayName = "TC12 - Grader: Throws when transcript empty")]
        public async Task GradeSpeakingAsync_ShouldThrow_WhenTranscriptEmpty()
        {
            var grader = CreateGrader();
            _output.WriteLine("Input: Empty transcript");
            await Assert.ThrowsAsync<System.ArgumentException>(() => grader.GradeSpeakingAsync("", "Describe a person"));
            _output.WriteLine("Output: Exception ArgumentException (Transcript cannot be empty)");
        }

        [Fact(DisplayName = "TC13 - Grader: Extract JSON safely")]
        public void ExtractJson_ShouldReturnEmpty_WhenBadString()
        {
            _output.WriteLine("Input: Raw text without valid JSON");
            var raw = "This is not a JSON";
            var result = typeof(AISpeakingService.GradingModule)
     .GetMethod("ExtractJsonString", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)?
     .Invoke(null, new object[] { raw })?.ToString();

            _output.WriteLine($"Output: Extracted JSON = '{result}'");
            Assert.NotNull(result);
        }

        [Fact(DisplayName = "TC14 - Grader: Handle fake API key")]
        public async Task GradeSpeakingAsync_ShouldThrow_OnFakeKey()
        {
            var grader = CreateGrader();
            _output.WriteLine("Input: Transcript='My favorite book...', Topic='Describe a book'");
            await Assert.ThrowsAsync<System.Collections.Generic.KeyNotFoundException>(() => grader.GradeSpeakingAsync("My favorite book...", "Describe a book"));
            _output.WriteLine("Output: Exception KeyNotFound (invalid API key)");
        }
    }
}
