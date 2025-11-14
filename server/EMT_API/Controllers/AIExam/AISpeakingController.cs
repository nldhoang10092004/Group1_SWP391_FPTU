using EMT_API.DTOs.AITest;
using EMT_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EMT_API.Data;
using EMT_API.Utils;
using System.Security.Claims;
using EMT_API.DAOs.MembershipDAO;

namespace EMT_API.Controllers.AI
{
    [ApiController]
    [Route("api/user/ai-speaking")]
    [Authorize(Roles = "STUDENT")]
    public class AISpeakingController : ControllerBase
    {
        private readonly AISpeakingService _ai;
        private readonly IMembershipDAO _db;
        private readonly ILogger<AISpeakingController> _logger;

        public AISpeakingController(AISpeakingService ai, IMembershipDAO db, ILogger<AISpeakingController> logger)
        {
            _ai = ai;
            _db = db;
            _logger = logger;
        }

        // ======================================================
        // 🔹 Helper: Get UserID
        // ======================================================
        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private async Task<bool> CheckMembershipAsync()
        {
            var userId = GetUserId();
            return await _db.HasActiveMembershipAsync(GetUserId());

        }

        private IActionResult MembershipError()
            => StatusCode(403, new { message = "Membership required or expired." });

        private IActionResult BadRequestError(string msg)
            => BadRequest(new { message = msg });

        // ======================================================
        // 🔹 Generate AI Speaking Prompt
        // ======================================================
        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePrompt()
        {
            if (!await CheckMembershipAsync()) return MembershipError();

            var (title, content) = await _ai.GenerateSpeakingPromptAsync();
            return Ok(new { Title = title, Content = content });
        }

        // ======================================================
        // 🔹 Submit (Transcribe + Grade)
        // ======================================================
        [HttpPost("submit")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(25_000_000)]
        public async Task<IActionResult> Submit([FromForm] AISpeakingSubmitAudioRequest req)
        {
            if (!await CheckMembershipAsync()) return MembershipError();

            var validationResult = ValidateSubmitRequest(req);
            if (validationResult != null) return validationResult;

            try
            {
                var transcript = await TranscribeAudioAsync(req.File);
                var gradeResult = await GradeTranscriptAsync(transcript, req.PromptContent);

                return Ok(new
                {
                    Transcript = transcript,
                    gradeResult.Score,
                    gradeResult.Fluency,
                    gradeResult.LexicalResource,
                    gradeResult.Grammar,
                    gradeResult.Pronunciation,
                    gradeResult.Feedback
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Speaking submit failed.");
                return StatusCode(500, new { message = "Internal error while grading speaking test." });
            }
        }

        // ======================================================
        // 🔸 Sub-module: Validation
        // ======================================================
        private IActionResult? ValidateSubmitRequest(AISpeakingSubmitAudioRequest req)
        {
            if (req.File == null || req.File.Length == 0)
                return BadRequestError("Please upload a valid audio file.");

            if (string.IsNullOrWhiteSpace(req.PromptContent))
                return BadRequestError("Missing AI-generated prompt.");

            return null;
        }

        // ======================================================
        // 🔸 Sub-module: Transcribe
        // ======================================================
        private async Task<string> TranscribeAudioAsync(IFormFile file)
        {
            _logger.LogInformation("Transcribing file: {Name}", file.FileName);
            var transcript = await _ai.TranscribeAsync(file);
            _logger.LogInformation("Transcribed {length} chars", transcript.Length);
            return transcript;
        }

        // ======================================================
        // 🔸 Sub-module: Grade
        // ======================================================
        private async Task<(decimal Score, decimal Fluency, decimal LexicalResource, decimal Grammar, decimal Pronunciation, string Feedback)>
            GradeTranscriptAsync(string transcript, string prompt)
        {
            _logger.LogInformation("Grading transcript of length {len}", transcript.Length);

            var (score, flu, lex, gra, pro, fb) = await _ai.GradeSpeakingAsync(transcript, prompt);
            return (score, flu, lex, gra, pro, fb);
        }
    }
}
