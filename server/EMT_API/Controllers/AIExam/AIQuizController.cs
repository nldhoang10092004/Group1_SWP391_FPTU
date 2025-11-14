using EMT_API.DAOs.UserDAO;
using EMT_API.Data;
using EMT_API.DTOs.AITest;
using EMT_API.Services;
using EMT_API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace EMT_API.Controllers.AI
{
    [ApiController]
    [Route("api/teacher/ai-quiz")]
    [Authorize(Roles = "TEACHER,ADMIN")]
    public class AIQuizController : ControllerBase
    {
        private readonly AIQuizService _ai;

        public AIQuizController(AIQuizService ai)
        {
            _ai = ai;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// Generate quiz JSON based on teacher/admin request.
        /// </summary>
        [HttpPost("generate")]
        public async Task<ActionResult<AIQuizResponse>> GenerateQuiz([FromBody] AIQuizRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Prompt))
                return BadRequest("Prompt cannot be empty.");

            var json = await _ai.GenerateQuizAsync(req.Prompt);

            try
            {
                var parsed = JsonDocument.Parse(json);
                return Ok(new AIQuizResponse
                {
                    Json = parsed.RootElement,
                    RawText = json
                });
            }
            catch (JsonException)
            {
                return Ok(new AIQuizResponse
                {
                    RawText = json,
                    Error = "Failed to parse JSON from AI response. Check formatting."
                });
            }
        }
    }
}
