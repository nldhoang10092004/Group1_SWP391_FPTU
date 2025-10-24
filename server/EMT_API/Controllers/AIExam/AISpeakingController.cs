using EMT_API.DTOs.AITest;
using EMT_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EMT_API.Data;
using EMT_API.Utils;
using System.Security.Claims;

namespace EMT_API.Controllers.AI
{
    [ApiController]
    [Route("api/user/ai-speaking")]
    [Authorize(Roles = "STUDENT")]
    public class AISpeakingController : ControllerBase
    {
        private readonly AISpeakingService _ai;
        private readonly EMTDbContext _db;

        public AISpeakingController(AISpeakingService ai, EMTDbContext db)
        {
            _ai = ai;
            _db = db;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);


        [HttpPost("transcribe")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(25_000_000)]
        public async Task<IActionResult> Transcribe([FromForm] AudioUploadRequest request)
        {
            bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, GetUserId());
            if (!hasMembership)
                return StatusCode(403, new { message = "Membership required or expired." });
            var file = request.File;
            if (file == null || file.Length == 0)
                return BadRequest("Please upload a valid audio file.");

            var transcript = await _ai.TranscribeAsync(file);
            return Ok(new { transcript });
        }


        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePrompt()
        {
            bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, GetUserId());
            if (!hasMembership)
                return StatusCode(403, new { message = "Membership required or expired." });

            var (title, content) = await _ai.GenerateSpeakingPromptAsync();
            return Ok(new { Title = title, Content = content });
        }

        [HttpPost("grade")]
        public async Task<IActionResult> Grade([FromBody] AISpeakingSubmitRequest req)
        {
            bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, GetUserId());
            if (!hasMembership)
                return StatusCode(403, new { message = "Membership required or expired." });

            if (req == null || string.IsNullOrWhiteSpace(req.Transcript))
                return BadRequest("Transcript cannot be empty.");
            if (string.IsNullOrWhiteSpace(req.PromptContent))
                return BadRequest("Missing AI-generated generated question.");

            if (string.IsNullOrWhiteSpace(req.Transcript))
                return BadRequest("Transcript cannot be empty.");

            var (overall, fluency, lexical, grammar, pronunciation, feedback) =
                await _ai.GradeSpeakingAsync(req.Transcript, req.PromptContent);

            return Ok(new
            {
                Score = overall,
                Fluency = fluency,
                LexicalResource = lexical,
                Grammar = grammar,
                Pronunciation = pronunciation,
                Feedback = feedback
            });
        }
    }
}
