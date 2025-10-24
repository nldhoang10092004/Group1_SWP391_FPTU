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


        // ===========================
        // 🔹 Generate vẫn giữ nguyên
        // ===========================
        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePrompt()
        {
            bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, GetUserId());
            if (!hasMembership)
                return StatusCode(403, new { message = "Membership required or expired." });

            var (title, content) = await _ai.GenerateSpeakingPromptAsync();
            return Ok(new { Title = title, Content = content });
        }


        // ===========================
        // 🔹 Submit gộp Transcribe + Grade
        // ===========================
        [HttpPost("submit")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(25_000_000)]
        public async Task<IActionResult> Submit([FromForm] AISpeakingSubmitAudioRequest req)
        {
            bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, GetUserId());
            if (!hasMembership)
                return StatusCode(403, new { message = "Membership required or expired." });

            if (req.File == null || req.File.Length == 0)
                return BadRequest("Please upload a valid audio file.");

            if (string.IsNullOrWhiteSpace(req.PromptContent))
                return BadRequest("Missing AI-generated prompt.");

            // 1️⃣ Transcribe
            var transcript = await _ai.TranscribeAsync(req.File);

            // 2️⃣ Grade
            var (overall, fluency, lexical, grammar, pronunciation, feedback) =
                await _ai.GradeSpeakingAsync(transcript, req.PromptContent);

            // 3️⃣ Trả về toàn bộ
            return Ok(new
            {
                Transcript = transcript,
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
