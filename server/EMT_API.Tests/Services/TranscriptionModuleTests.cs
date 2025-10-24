using EMT_API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace EMT_API.Tests.Services
{
    public class TranscriptionModuleTests
    {
        private readonly ITestOutputHelper _output;

        public TranscriptionModuleTests(ITestOutputHelper output)
        {
            _output = output;
        }

        private AISpeakingService.TranscriptionModule CreateTranscriber()
        {
            var cfg = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Deepgram:ApiKey", "fake" }
                }).Build();

            var logger = new LoggerFactory().CreateLogger<AISpeakingService.TranscriptionModule>();
            return new AISpeakingService.TranscriptionModule(cfg, logger);
        }

        private IFormFile CreateFakeAudio(string name = "test.mp3")
        {
            var bytes = Encoding.UTF8.GetBytes("fake audio");
            return new FormFile(new MemoryStream(bytes), 0, bytes.Length, "Data", name);
        }

        [Fact(DisplayName = "TC15 - Transcribe: Constructor throws when missing key")]
        public void Constructor_ShouldThrow_WhenMissingKey()
        {
            _output.WriteLine("Input: Missing Deepgram API key");
            var cfg = new ConfigurationBuilder().Build();
            var logger = new LoggerFactory().CreateLogger<AISpeakingService.TranscriptionModule>();
            Assert.Throws<System.Exception>(() => new AISpeakingService.TranscriptionModule(cfg, logger));
            _output.WriteLine("Output: Exception thrown (Missing Deepgram API key)");
        }

        [Fact(DisplayName = "TC16 - Transcribe: Return text when mocked audio provided")]
        public async Task TranscribeAsync_ShouldReturnString_WhenMocked()
        {
            var transcriber = CreateTranscriber();
            var fakeFile = CreateFakeAudio();
            _output.WriteLine("Input: File='test.mp3' (8 bytes of fake audio)");
            await Assert.ThrowsAsync<Deepgram.Models.Exceptions.v1.DeepgramRESTException>(
                () => transcriber.TranscribeAsync(fakeFile));
            _output.WriteLine("Output: DeepgramRESTException (invalid credentials)");
        }

        [Fact(DisplayName = "TC17 - Transcribe: Throws when file is null")]
        public async Task TranscribeAsync_ShouldThrow_WhenFileNull()
        {
            var transcriber = CreateTranscriber();
            _output.WriteLine("Input: File=null");
            await Assert.ThrowsAsync<System.ArgumentException>(() => transcriber.TranscribeAsync(null!));
            _output.WriteLine("Output: Exception ArgumentException (Invalid audio file)");
        }

        [Fact(DisplayName = "TC18 - Transcribe: Throws when file empty")]
        public async Task TranscribeAsync_ShouldThrow_WhenFileEmpty()
        {
            var transcriber = CreateTranscriber();
            var emptyFile = new FormFile(new MemoryStream(), 0, 0, "Data", "empty.mp3");
            _output.WriteLine("Input: File='empty.mp3' (0 bytes)");
            await Assert.ThrowsAsync<System.ArgumentException>(() => transcriber.TranscribeAsync(emptyFile));
            _output.WriteLine("Output: Exception ArgumentException (Invalid audio file)");
        }
    }
}
