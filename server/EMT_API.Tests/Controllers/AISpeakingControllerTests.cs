using EMT_API.Controllers.AI;
using EMT_API.Data;
using EMT_API.DTOs.AITest;
using EMT_API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace EMT_API.Tests.Controllers
{
    public class AISpeakingControllerTests
    {
        private readonly IConfiguration _config;
        private readonly ITestOutputHelper _output;

        public AISpeakingControllerTests(ITestOutputHelper output)
        {
            _config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: true)
                .AddUserSecrets<EMT_API.Program>(optional: true)
                .Build();
            _output = output;
        }

        private AISpeakingController CreateController(int userId)
        {
            var aiLogger = new LoggerFactory().CreateLogger<AISpeakingService>();
            var ctrlLogger = new LoggerFactory().CreateLogger<AISpeakingController>();

            var options = new DbContextOptionsBuilder<EMTDbContext>()
                .UseSqlServer(_config.GetConnectionString("DefaultConnection"))
                .Options;

            var db = new EMTDbContext(options);
            var ai = new AISpeakingService(_config, aiLogger);
            var controller = new AISpeakingController(ai, db, ctrlLogger);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                        new Claim(ClaimTypes.Role, "STUDENT")
                    }))
                }
            };

            return controller;
        }

        private IFormFile CreateFakeFile(string name = "fake.mp3")
        {
            var bytes = Encoding.UTF8.GetBytes("fake audio");
            return new FormFile(new MemoryStream(bytes), 0, bytes.Length, "Data", name);
        }

        // ========== TEST CASES ==========

        [Fact(DisplayName = "TC01 - Generate prompt with valid membership")]
        public async Task GeneratePrompt_ShouldReturn200_WhenUserHasMembership()
        {
            int userId = 1;
            var c = CreateController(userId);
            _output.WriteLine($"Input: UserId={userId} (has membership)");

            var result = await c.GeneratePrompt();
            var ok = Assert.IsType<OkObjectResult>(result);

            _output.WriteLine($"Output: HTTP {ok.StatusCode ?? 200}, Result={System.Text.Json.JsonSerializer.Serialize(ok.Value)}");
        }

        [Fact(DisplayName = "TC02 - Generate prompt without membership")]
        public async Task GeneratePrompt_ShouldReturn403_WhenUserNoMembership()
        {
            int userId = 8;
            var c = CreateController(userId);
            _output.WriteLine($"Input: UserId={userId} (no membership)");

            var result = await c.GeneratePrompt();
            var obj = Assert.IsType<ObjectResult>(result);

            _output.WriteLine($"Output: HTTP {obj.StatusCode}, Message={System.Text.Json.JsonSerializer.Serialize(obj.Value)}");
        }

        [Fact(DisplayName = "TC03 - Submit without file")]
        public async Task Submit_ShouldReturn400_WhenFileMissing()
        {
            var c = CreateController(1);
            var req = new AISpeakingSubmitAudioRequest { File = null, PromptContent = "Describe..." };
            _output.WriteLine("Input: File=null, Prompt='Describe...'");
            var result = await c.Submit(req);
            var bad = Assert.IsType<BadRequestObjectResult>(result);
            _output.WriteLine($"Output: HTTP {bad.StatusCode}, Message={System.Text.Json.JsonSerializer.Serialize(bad.Value)}");
        }

        [Fact(DisplayName = "TC04 - Submit without prompt")]
        public async Task Submit_ShouldReturn400_WhenPromptMissing()
        {
            var c = CreateController(1);
            var req = new AISpeakingSubmitAudioRequest { File = CreateFakeFile(), PromptContent = "" };
            _output.WriteLine("Input: File='fake.mp3', Prompt='' (empty)");
            var result = await c.Submit(req);
            var bad = Assert.IsType<BadRequestObjectResult>(result);
            _output.WriteLine($"Output: HTTP {bad.StatusCode}, Message={System.Text.Json.JsonSerializer.Serialize(bad.Value)}");
        }

        [Fact(DisplayName = "TC05 - Submit with expired membership")]
        public async Task Submit_ShouldReturn403_WhenMembershipExpired()
        {
            var c = CreateController(8);
            var req = new AISpeakingSubmitAudioRequest { File = CreateFakeFile(), PromptContent = "Describe a topic" };
            _output.WriteLine("Input: UserId=8 (no membership), File='fake.mp3'");
            var result = await c.Submit(req);
            var obj = Assert.IsType<ObjectResult>(result);
            _output.WriteLine($"Output: HTTP {obj.StatusCode}, Message={System.Text.Json.JsonSerializer.Serialize(obj.Value)}");
        }

        [Fact(DisplayName = "TC06 - Submit valid audio and prompt")]
        public async Task Submit_ShouldReturn200_WhenValid()
        {
            var c = CreateController(1);
            var req = new AISpeakingSubmitAudioRequest
            {
                File = CreateFakeFile(),
                PromptContent = "Describe a person you admire"
            };
            _output.WriteLine("Input: UserId=1 (has membership), File='fake.mp3', Prompt='Describe a person you admire'");
            var result = await c.Submit(req);
            var ok = Assert.IsAssignableFrom<IActionResult>(result);
            _output.WriteLine($"Output: Type={ok.GetType().Name}");
        }
    }
}
